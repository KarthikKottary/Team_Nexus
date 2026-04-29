const Notice = require('../models/Notice');

exports.createNotice = async (req, res) => {
  try {
    const { title, message, targetRole, phase, priority } = req.body;
    
    const notice = new Notice({
      title,
      message,
      targetRole: targetRole || 'all',
      phase: phase || 'general',
      priority: priority || 'normal',
      createdBy: req.user._id
    });
    
    await notice.save();

    // Broadcast the new notice to all connected clients
    req.io.emit('new_notice', notice);

    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const role = req.user.role; // 'admin' or 'participant'
    
    // Users can see 'all' messages, plus messages specifically for their role
    const query = { 
      active: true, 
      targetRole: { $in: ['all', role] } 
    };
    
    // Optionally filter by phase if provided in query
    if (req.query.phase) {
      query.phase = req.query.phase;
    }

    const notices = await Notice.find(query).sort({ createdAt: -1 }).limit(20);
    
    res.status(200).json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
