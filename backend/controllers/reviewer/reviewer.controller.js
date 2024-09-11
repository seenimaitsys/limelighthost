import { ErrorHandler } from "../../helpers/handleError/error.js";
import {
  getNeedtoReviewVideo,
  doUpadateVoideoStatus,
  checkVideoIsAlearadyUpdate,
} from "../../models/reviewer/reviewer.model.js";

export const doGetVideo = async (req, res, next) => {
  try {
    const singleVideo = await getNeedtoReviewVideo([]);
    res.status(200).json(singleVideo || []);
  } catch (error) {
    next(error);
  }
};
export const doUpdateVideoStatus = async (req, res) => {
  const { vidoeInfo, videostatus } = req.body;

  try {
    const result = await checkVideoIsAlearadyUpdate(vidoeInfo.video.id);
    if (result) {
      const responseResult = await doUpadateVoideoStatus(
        vidoeInfo.video.id,
        videostatus,
        req.userdata
      );

      responseResult
        ? res.status(200).json({
            videoCount: vidoeInfo.videoCount
              ? vidoeInfo.videoCount - 1
              : vidoeInfo.videoCount,
            video: vidoeInfo.video,
            message: {
              heading: "Video Reviewed Successfully!",
              title: videostatus
                ? `Decline : ${videostatus}.`
                : `Video has been Approved.`,
              variant: `success`,
            },
          })
        : res.status(200).json({
            videoCount: vidoeInfo.videoCount
              ? vidoeInfo.videoCount - 1
              : vidoeInfo.videoCount,
            video: vidoeInfo.video,
            message: {
              heading: "Somthing worng!",
              title: `check your internet connection and try again.`,
              variant: `warning`,
            },
          });
    } else {
      res.status(201).json({
        videoCount: vidoeInfo.videoCount
          ? vidoeInfo.videoCount - 1
          : vidoeInfo.videoCount,
        video: vidoeInfo.video,
        message: {
          heading: "Videois alearady update!",
          title: `Someone review this video so review next video.`,
          variant: `warning`,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
