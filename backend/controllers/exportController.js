const { Parser } = require('json2csv');
const Alert = require('../models/Alert');
const Team = require('../models/Team');

const exportReport = async (req, res) => {
  try {
    const alerts = await Alert.find().populate('team', 'name').lean();
    const teams = await Team.find().lean();

    // Map Alerts data
    const alertData = alerts.map((a) => ({
      Category: 'Alert',
      NameOrType: a.type,
      LocationOrRepo: a.location,
      TimestampOrCommits: a.createdAt,
      Status: a.active ? 'Active' : 'Resolved'
    }));

    // Map Teams data
    const teamData = teams.map((t) => ({
      Category: 'Team',
      NameOrType: t.name,
      LocationOrRepo: t.repo || 'No repo',
      TimestampOrCommits: t.recentCommits?.length || 0,
      Status: t.status
    }));

    const combinedData = [...alertData, ...teamData];

    if (combinedData.length === 0) {
      return res.status(404).json({ success: false, message: 'No data to export' });
    }

    const fields = ['Category', 'NameOrType', 'LocationOrRepo', 'TimestampOrCommits', 'Status'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(combinedData);

    res.header('Content-Type', 'text/csv');
    res.attachment('hackathon_report.csv');
    return res.send(csv);
  } catch (err) {
    console.error('Export Report Error:', err);
    res.status(500).json({ success: false, message: 'Server error generating report' });
  }
};

module.exports = { exportReport };
