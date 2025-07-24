const { getOverallFeedbackSummaryDB, getOverallFeedbackSummaryByQuestionDB, getFeedbacksDB, searchFeedbacksDB } = require("../services/feedback.service");

exports.getFeedbackInit = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const [overallFeedbackCounting, summary, feedbacks] = await Promise.all([
      getOverallFeedbackSummaryDB(tenantId),
      getOverallFeedbackSummaryByQuestionDB(tenantId),
      getFeedbacksDB('last_7days', null, null, tenantId)
    ]);

    return res.status(200).json({
      overallFeedbackCounting: {
        loved: overallFeedbackCounting?.loved || 0,
        good: overallFeedbackCounting?.good || 0,
        average: overallFeedbackCounting?.average || 0,
        bad: overallFeedbackCounting?.bad || 0,
        worst: overallFeedbackCounting?.worst || 0,
      }, 
      averageRating: summary?.average_rating || 0,
      foodRating: summary?.food_quality_rating || 0,
      staffRating: summary?.staff_behavior_rating || 0,
      ambianceRating: summary?.ambiance_rating || 0,
      serviceRating: summary?.service_rating || 0,
      recommendRating: summary?.recommend_rating || 0,
      feedbacks: feedbacks || []
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const from = req.query.from || null;
    const to = req.query.to || null;
    const type = req.query.type;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: req.__("please_provide_required_details"), // Translate message
      });
    }

    if (type == "custom") {
      if (!(from && to) || (from == 'null' || to == 'null')) {
        return res.status(400).json({
          success: false,
          message: req.__("provide_from_to_dates"), // Translate message
        });
      }
    }

    const result = await getFeedbacksDB(type, from, to, tenantId);

    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};

exports.searchFeedbacks = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const searchString = req.query.q;

    if (!searchString) {
      return res.status(400).json({
        success: false,
        message: req.__("please_provide_required_details"), // Translate message
      });
    }

    const result = await searchFeedbacksDB(searchString, tenantId);

    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: req.__("something_went_wrong_try_later"), // Translate message
    });
  }
};