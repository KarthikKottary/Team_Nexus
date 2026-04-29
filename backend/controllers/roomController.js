const Room = require('../models/Room');
const Team = require('../models/Team');

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, capacity } = req.body;
    const room = new Room({ name, capacity });
    await room.save();
    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all rooms with assigned teams
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('assignedTeams', 'name college_name members');
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Intelligent Room Allocation Algorithm
exports.allocateRooms = async (req, res) => {
  try {
    // 1. Reset all existing allocations
    await Room.updateMany({}, { $set: { assignedTeams: [], currentOccupancy: 0 } });
    await Team.updateMany({}, { $set: { room: null } });

    const rooms = await Room.find();
    // Reset local state
    rooms.forEach(r => { r.assignedTeams = []; r.currentOccupancy = 0; });

    const teams = await Team.find().populate('members');
    
    // 2. Format teams for processing
    const unassignedTeams = teams.map(t => ({
      _id: t._id,
      name: t.name,
      college_name: t.college_name,
      size: t.members.length || 1 // Assuming at least 1 person per team for space allocation
    }));

    // 3. Group by college for "Prefer same college grouping" logic
    const collegeGroups = {};
    unassignedTeams.forEach(t => {
      if (!collegeGroups[t.college_name]) collegeGroups[t.college_name] = { totalSize: 0, teams: [] };
      collegeGroups[t.college_name].teams.push(t);
      collegeGroups[t.college_name].totalSize += t.size;
    });

    // Sort colleges by total size (largest first) to optimize capacity
    const sortedColleges = Object.keys(collegeGroups).sort((a, b) => collegeGroups[b].totalSize - collegeGroups[a].totalSize);
    
    const conflicts = [];

    // 4. Algorithm execution
    for (const college of sortedColleges) {
      const group = collegeGroups[college];
      // Sort teams within the college by size (descending)
      group.teams.sort((a, b) => b.size - a.size);

      for (const team of group.teams) {
        // Find optimal room based on criteria
        
        // Strategy A: Find room that already has teams from this college and fits this team
        let targetRoom = rooms.find(r => 
          (r.capacity - r.currentOccupancy) >= team.size &&
          r.assignedTeams.some(assignedId => {
             const assignedTeam = unassignedTeams.find(t => t._id.equals(assignedId));
             return assignedTeam && assignedTeam.college_name === college;
          })
        );

        // Strategy B: If no such room, find an empty room that fits (smallest empty room to optimize capacity)
        if (!targetRoom) {
          const emptyRooms = rooms.filter(r => r.currentOccupancy === 0 && r.capacity >= team.size);
          if (emptyRooms.length > 0) {
            emptyRooms.sort((a, b) => a.capacity - b.capacity);
            targetRoom = emptyRooms[0];
          }
        }

        // Strategy C: Find any room with the most available space that fits
        if (!targetRoom) {
          const availableRooms = rooms.filter(r => (r.capacity - r.currentOccupancy) >= team.size);
          if (availableRooms.length > 0) {
             availableRooms.sort((a, b) => (b.capacity - b.currentOccupancy) - (a.capacity - a.currentOccupancy));
             targetRoom = availableRooms[0];
          }
        }

        if (targetRoom) {
          // Assign team to room
          targetRoom.assignedTeams.push(team._id);
          targetRoom.currentOccupancy += team.size;
          team.assignedRoom = targetRoom._id;
        } else {
          // Conflict: No room can fit this team (Overflow)
          conflicts.push({ team: team.name, size: team.size });
        }
      }
    }

    // 5. Persist assignments back to DB
    for (const r of rooms) {
      await Room.findByIdAndUpdate(r._id, {
        assignedTeams: r.assignedTeams,
        currentOccupancy: r.currentOccupancy
      });
    }

    for (const t of unassignedTeams) {
      if (t.assignedRoom) {
        await Team.findByIdAndUpdate(t._id, { room: t.assignedRoom });
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Intelligent room allocation completed',
      conflicts,
      unassignedCount: conflicts.length 
    });

  } catch (error) {
    console.error('Room allocation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
