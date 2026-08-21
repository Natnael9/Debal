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