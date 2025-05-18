const Meeting = require("../../model/schema/meeting");

const create = async (req, res) => {
  try {
    const {
      agenda,
      attendes,
      attendesLead,
      location,
      related,
      dateTime,
      notes,
    } = req.body;

    const meeting = new Meeting({
      agenda,
      attendes,
      attendesLead,
      location,
      related,
      dateTime,
      notes,
      createBy: req.user.userId,
    });

    const savedMeeting = await meeting.save();

    const populatedMeeting = await Meeting.findById(savedMeeting._id)
      // .populate("attendes")
      // .populate("attendesLead")
      .populate({
        path: "createBy",
        select: "firstName lastName",
      });

    res.status(201).json(populatedMeeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const index = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, startDate, endDate } = req.query;
    const query = { deleted: false };

    if (search) {
      query.$or = [
        { agenda: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      query.dateTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const meetings = await Meeting.find(query)
      .populate("attendes")
      .populate("attendesLead")
      .populate("createBy")
      .sort({ dateTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(query);

    res.status(200).json({
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const view = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      deleted: false,
    })
      .populate({
        path: "attendes",
        select: "fullName",
      })
      // .populate("attendesLead")
      .populate({
        path: "attendesLead",
        select: "leadName",
      })
      .populate({
        path: "createBy",
        select: "firstName lastName",
      });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const {
      agenda,
      attendes,
      attendesLead,
      location,
      related,
      dateTime,
      notes,
    } = req.body;

    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, deleted: false },
      {
        $set: {
          agenda,
          attendes,
          attendesLead,
          location,
          related,
          dateTime,
          notes,
        },
      },
      { new: true }
    )
      .populate("attendes")
      .populate("attendesLead")
      .populate("createBy");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, deleted: false },
      { $set: { deleted: true } },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.status(200).json({ message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMany = async (req, res) => {
  try {
    const ids = req.body;

    const result = await Meeting.updateMany(
      { _id: { $in: ids }, deleted: false },
      { $set: { deleted: true } }
    );
    console.log("hello");
    console.log(ids);
    res.status(200).json({
      message: "Meetings deleted successffuly",
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create,
  index,
  view,
  update,
  deleteMeeting,
  deleteMany,
};
