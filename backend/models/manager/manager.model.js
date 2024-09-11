import pool from "../../config/database.js";
import { ErrorHandler } from "../../helpers/handleError/error.js";

export const getVideoCount_ReviewerStatus = async () => {
  const client = await pool.connect(); // Get a client from the pool
  try {
    await client.query("BEGIN"); // Start the transaction

    // Perform the getCount operation
    const getAllCount = await client.query(`SELECT COUNT(*) FROM lime_light`);
    const getRejectedvideos = await client.query(
      `SELECT COUNT(*) FROM lime_light WHERE video_status = 2;`
    );
    const getAcceptedVideos = await client.query(
      `SELECT COUNT(*) FROM lime_light WHERE video_status = 1;`
    );
    const getReviewerStatus = await client.query(
      `SELECT email,lastseen FROM users WHERE role_id=1;`
    );

    // Check if the result was successful
    if (
      (getAllCount.rowCount > 0 || getRejectedvideos.rowCount > 0) &&
      getReviewerStatus.rowCount > 0
    ) {
      await client.query("COMMIT");
      const result = {
        AcceptedVideos: +getAcceptedVideos.rows[0].count,
        RejectedVideos: +getRejectedvideos.rows[0].count,
        LimesInQueue:
          +getAllCount.rows[0].count -
          (+getAcceptedVideos.rows[0].count + +getRejectedvideos.rows[0].count),
        reviewerStatus: getReviewerStatus.rows,
      };
      return result;
    } else {
      await client.query("ROLLBACK");
      throw new ErrorHandler(500, "Failed to retrieve data");
    }
  } catch (error) {
    await client.query("ROLLBACK"); // If any query fails, rollback the transaction
    throw new ErrorHandler(500, "Failed to retrieve data");
  } finally {
    client.release(); // Release the client back to the pool
  }
};
export const getVideoList = async (video_status, reviewer_role) => {
  try {
    const result = await pool.query(
      `SELECT 
    lime_light.id,
    lime_light.video_name,
    lime_light.caption,
    lime_light.video_status,
    lime_light.video_preview_url,
    reviewed_Data.video_status_update,
    reviewed_Data.rejected_reason,
    users.email,
    roles.role_type  
FROM 
    lime_light 
JOIN 
    reviewed_Data ON lime_light.id = reviewed_Data.video_id
JOIN 
    users ON reviewed_Data.reviewed_by = users.id
JOIN 
    roles ON users.role_id = roles.id  
WHERE
		lime_light.video_status = $1 and roles.role_type= $2 ORDER BY lime_light.created_time DESC

`,
      [video_status, reviewer_role]
    );

    return result.rows;
  } catch (err) {
    console.log(err);
    throw new ErrorHandler(500, "Failed to retrieve data");
  }
};

export const get_accepted_rejected_Video = async (video_id) => {
  try {
    return await pool.query(
      `SELECT 
    lime_light.id,
    lime_light.video_name,
    lime_light.caption,
    lime_light.video_status,
    lime_light.video_preview_url,
    reviewed_Data.video_status_update,
    reviewed_Data.rejected_reason,
    users.email,
    roles.role_type  
FROM 
    lime_light 
JOIN 
    reviewed_Data ON lime_light.id = reviewed_Data.video_id
JOIN 
    users ON reviewed_Data.reviewed_by = users.id
JOIN 
    roles ON users.role_id = roles.id  
WHERE
	lime_light.id = $1 LIMIT 1;
`,
      [video_id]
    );
  } catch (error) {
    throw new ErrorHandler(500, "Failed to retrieve data");
  }
};
export const getSingleVideo = async (idArray, videoStatus, reviewer_role) => {
  try {
    const videoQueryText = `SELECT 
    lime_light.id,
    lime_light.video_name,
    lime_light.caption,
    lime_light.video_status,
    lime_light.video_preview_url,
    reviewed_Data.video_status_update,
    reviewed_Data.rejected_reason,
    users.email,
    roles.role_type  
FROM 
    lime_light 
JOIN 
    reviewed_Data ON lime_light.id = reviewed_Data.video_id
JOIN 
    users ON reviewed_Data.reviewed_by = users.id
JOIN 
    roles ON users.role_id = roles.id
WHERE
	lime_light.video_status = $1 AND roles.role_type=$2 ${
    idArray.length > 0
      ? `AND lime_light.id NOT IN (${idArray
          .map((_, i) => `$${i + 3}`) // Start indexing from $3
          .join(", ")})`
      : ""
  } ORDER BY lime_light.created_time DESC LIMIT 1;
`;

    const videoQueryResult = await pool.query(videoQueryText, [
      videoStatus,
      reviewer_role,
      ...idArray,
    ]);
    if (videoQueryResult.rows.length > 0) {
      return videoQueryResult; // Send the first video that matches the criteria
    } else {
      return await pool.query(
        `SELECT 
    lime_light.id,
    lime_light.video_name,
    lime_light.caption,
    lime_light.video_status,
    lime_light.video_preview_url,
    reviewed_Data.video_status_update,
    reviewed_Data.rejected_reason,
    users.email,
    roles.role_type  
FROM 
    lime_light 
JOIN 
    reviewed_Data ON lime_light.id = reviewed_Data.video_id
JOIN 
    users ON reviewed_Data.reviewed_by = users.id
JOIN 
    roles ON users.role_id = roles.id
WHERE
	lime_light.video_status = $1 AND roles.role_type=$2 ORDER BY lime_light.created_time DESC LIMIT 1;
`,
        [videoStatus, reviewer_role]
      );
    }
  } catch (error) {
    throw new ErrorHandler(500, "Failed to retrieve data");
  }
};
export const getreUpdateVideoStatus = async (
  userdata,
  videoId,
  changeStatus
) => {
  const updateStatus = changeStatus ? 2 : 1;
  const Accepted = "A";
  const client = await pool.connect(); // Get a client from the pool

  try {
    await client.query("BEGIN"); // Start the transaction

    // Perform the update operation
    const updateResult = await client.query(
      `UPDATE lime_light SET video_status=$2 WHERE id = $1;`,
      [videoId, updateStatus]
    );
    const insertReviewedData = await client.query(
      `UPDATE reviewed_Data SET reviewed_by=$2, rejected_reason=$3 WHERE video_id=$1;`,
      [videoId, userdata.id, changeStatus || Accepted]
    );

    // If both queries are successful and have valid results, commit the transaction
    if (updateResult.rowCount > 0 && insertReviewedData.rowCount > 0) {
      await client.query("COMMIT");
      return true;
    } else {
      await client.query("ROLLBACK");
      return false;
    }
  } catch (error) {
    return false;
  } finally {
    client.release(); // Release the client back to the pool
  }
};
