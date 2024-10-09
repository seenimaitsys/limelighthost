import https from "../../axios";
export const doGetReviewerStatus = async () => {
  try {
    return await https.post("/api/manager/getcount");
  } catch (exception) {
    return {
      loading: false,
      success: false,
      message: exception.message,
    };
  }
};
