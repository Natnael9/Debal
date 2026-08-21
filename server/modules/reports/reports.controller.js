import Report from './reports.model.js';

export const createReport = async (req, reply) => {
  try {
    // 1. Extract the data from the frontend's request body[cite: 3]
    const { reportedUserId, reason, details } = req.body;
    
    // 2. Get the ID of the person making the report (attached by your auth middleware)
    const reporterId = req.user._id; 

    // 3. Create the new report object
    const newReport = new Report({
      reporterId,
      reportedUserId,
      reason,
      details,
      status: 'open' // Default status when a report is first made[cite: 2]
    });

    // 4. Save it to MongoDB
    await newReport.save();

    // 5. Send a success response back to the frontend
    return reply.code(201).send({
      success: true,
      message: 'Report submitted successfully'
    });
    
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ 
      success: false, 
      message: 'Failed to submit report' 
    });
  }
};

export const listReports = async (req, reply) => {
  try {
    const { status } = req.query || {};
    const query = status ? { status } : {};
    const reports = await Report.find(query)
      .populate('reporterId', 'name email avatarUrl')
      .populate('reportedUserId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    const formatted = reports.map((r) => ({
      id: r._id,
      _id: r._id,
      reportedUser: {
        id: r.reportedUserId?._id,
        name: r.reportedUserId?.name || 'Unknown User',
        email: r.reportedUserId?.email,
      },
      reportedBy: {
        id: r.reporterId?._id,
        name: r.reporterId?.name || 'Anonymous',
        email: r.reporterId?.email,
      },
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt,
    }));

    return reply.send({ success: true, data: { reports: formatted } });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ success: false, message: 'Failed to fetch reports' });
  }
};

export const updateReportStatus = async (req, reply) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body || {};

    const report = await Report.findById(id);
    if (!report) {
      return reply.code(404).send({ success: false, message: 'Report not found' });
    }

    report.status = status || 'resolved';
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedAt = new Date();
    report.resolvedBy = req.user?._id;
    await report.save();

    return reply.send({ success: true, message: 'Report status updated', data: { report } });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ success: false, message: 'Failed to update report' });
  }
};