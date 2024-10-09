import { ErrorHandler } from "../../helpers/handleError/error.js";
import {
  getVideoCount_ReviewerStatus,
  getVideoList,
  get_accepted_rejected_Video,
  getSingleVideo,
  getreUpdateVideoStatus,
} from "../../models/manager/manager.model.js";
export const doGetCount = async (req, res, next) => {
  try {
    const result = await getVideoCount_ReviewerStatus();
    res.status(200).json(result);
  } catch (error) {
    next(error);
    
  }
};
export const doGetList = async (req, res, next) => {
  const { video_status, reviewer_role } = req.body;
  console.log(video_status, reviewer_role);

  try {
    const result = await getVideoList(video_status, reviewer_role);

    res.status(200).json({ video_status, reviewer_role, List: result });
  } catch (error) {
    next(error);
  }
};
export const doGetVideoByID = async (req, res, next) => {
  const { id } = req.body;

  try {
    const singleVideo = await get_accepted_rejected_Video(id);

    res.status(200).json({
      video: singleVideo.rows[0] || [],
      idArray: [],
      AlertMessage: {
        heading:
          singleVideo.rows[0].video_status == 2
            ? `This Video is rejected by ${
                singleVideo.rows[0].role_type === "RR"
                  ? "Reviewer."
                  : "Manager."
              }`
            : "Video has been Approved!",
        title:
          singleVideo.rows[0].rejected_reason !== "A"
            ? `Decline: ${singleVideo.rows[0].rejected_reason}`
            : `This Video is Approved by ${
                singleVideo.rows[0].role_type === "RR"
                  ? "Reviewer."
                  : "Manager."
              }`,
        variant: singleVideo.rows[0].video_status == 2 ? `danger` : `success`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const doGetVideoForManager = async (req, res, next) => {
  const { idArray, videoStatus, reviewer_role } = req.body;

  try {
    const resut = await getSingleVideo(idArray, videoStatus, reviewer_role);

    if (idArray.includes(resut.rows[0]?.id)) {
      idArray.length = 0;
      const updateResult = await getSingleVideo(
        idArray,
        videoStatus,
        reviewer_role
      );
      res.status(200).json({
        video: updateResult.rows[0],
        idArray,
        AlertMessage: {
          heading:
            updateResult.rows[0].video_status == 2
              ? "Video has been Rejected!"
              : "Video has been Approved!",
          title:
            updateResult.rows[0].rejected_reason !== "A"
              ? `Decline: ${updateResult.rows[0].rejected_reason}`
              : `This Video is Approved by ${
                  updateResult.rows[0].reviewer_role === "RR"
                    ? "Reviewer."
                    : "Manager."
                }`,
          variant:
            updateResult.rows[0].video_status == 2 ? `danger` : `success`,
        },
      });
    } else {
      idArray.push(resut.rows[0]?.id);
      res.status(200).json({
        video: resut.rows[0],
        idArray,
        AlertMessage: {
          heading:
            resut.rows[0]?.video_status == 2
              ? "Video has been Rejected!"
              : "Video has been Approved!",
          title:
            resut.rows[0].rejected_reason !== "A"
              ? `Decline: ${resut.rows[0].rejected_reason}`
              : `This Video is Approved by ${
                  resut.rows[0].reviewer_role === "RR"
                    ? "Reviewer."
                    : "Manager."
                }`,
          variant: resut.rows[0].video_status == 2 ? `danger` : `success`,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
export const doChangeVideoStatus = async (req, res, next) => {
  const { vidoeInfo, videostatus } = req.body;

  try {
    const result = await getreUpdateVideoStatus(
      req.userdata,
      vidoeInfo.video.id,
      videostatus
    );
    if (result) {
      res.status(200).json({
        video: vidoeInfo.video,
        AlertMessage: {
          heading: videostatus
            ? "Video Status Changed Accepted to Rejected!"
            : "Video Status Changed Rejected to Accepted!",
          title: videostatus,
          email: `Reviewed by : ${req.userdata.email}`,
          variant: videostatus ? `danger` : `success`,
        },
      });
    } else {
      res.status(200).json({ video: vidoeInfo });
    }
  } catch (error) {
    next(error);
  }
};
