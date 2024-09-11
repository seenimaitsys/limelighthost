import pool from "../../config/database.js";
import { ErrorHandler } from "../../helpers/handleError/error.js";
// Assuming pool is your PostgreSQL connection pool

export const getNeedtoReviewVideo = async (arry) => {
  let excludeIds = arry;

  try {
    // Construct the query text with conditional exclusion of IDs
    const countQueryText = `SELECT COUNT(*) AS video_count FROM lime_light WHERE video_status = 0`;
    const videoQueryText = `SELECT * FROM lime_light WHERE video_status = 0
      ${
        excludeIds.length > 0
          ? `AND id NOT IN (${excludeIds.join(", ")})`
          : excludeIds
      }
      ORDER BY created_time ASC LIMIT 1`;

    const [countResult, videoResult] = await Promise.all([
      pool.query(countQueryText),
      pool.query(videoQueryText),
    ]);
    // Execute the query using the connection pool

    // Check if there is a result
    if (videoResult.rows.length > 0) {
      // Check if someone has watched the video
      const result = await checkSomeOneWatchVideo(videoResult.rows[0].id);

      if (!result.rows[0].exists) {
        // If someone has watched the video, return the result
        excludeIds.length = 0;
        await insertWatchVideo(videoResult.rows[0].id);
        return {
          videoCount: countResult.rows[0].video_count,
          video: videoResult.rows[0],
        };
      } else {
        // If no one has watched, recursively call the function

        excludeIds.push(videoResult.rows[0].id);
        return await getNeedtoReviewVideo(excludeIds);
      }
    } else {
      return {
        videoCount: countResult.rows[0].video_count,
        video: videoResult.rows[0] || [],
      };
    }
  } catch (err) {
    throw new ErrorHandler(500, "Failed to retrieve data"); // or handle as per your requirement
  }
};
export const checkSomeOneWatchVideo = async (id) => {
  try {
    return await pool.query(
      `SELECT EXISTS (SELECT 1 FROM liveWatchVideo WHERE videoid = $1)`,
      [id]
    );

    // if (result.rows[0].exists) {
    //   // const videoDta = await pool.query(
    //   //   `SELECT EXISTS (SELECT 1 FROM liveWatchVideo WHERE (videoid = $1 AND (watch_at < EXTRACT(EPOCH FROM NOW() - INTERVAL '4 MINUTES'))))`,
    //   //   [id]
    //   // );
    //   // if (videoDta.rows[0].exists) {
    //   //   return true;
    //   // } else {
    //   //   return false;
    //   // }
    // } else {
    //   return true;
    // }
  } catch (err) {
    return false;
  }
};
export const insertWatchVideo = async (videoId) => {
  try {
    await pool.query(
      `INSERT INTO liveWatchVideo (videoid)
      VALUES ($1)
      ON CONFLICT (videoid)
      DO UPDATE SET watch_at = EXTRACT(EPOCH FROM NOW())`,
      [videoId]
    );
  } catch (err) {
    throw new ErrorHandler(500, "Failed to retrieve data");
  }
};
export const checkVideoIsAlearadyUpdate = async (id) => {
  try {
    const result = await pool.query(
      `SELECT EXISTS (SELECT 1 FROM liveWatchVideo WHERE videoid = $1)`,
      [id]
    );

    if (result.rows[0].exists) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
export const doUpadateVoideoStatus = async (vidoeid, videostatus, userdata) => {
  const updateStatus = videostatus ? 2 : 1;
  const Accepted = "A";
  const client = await pool.connect(); // Get a client from the pool

  try {
    await client.query("BEGIN"); // Start the transaction

    // Perform the update operation
    const updateResult = await client.query(
      `UPDATE lime_light SET video_status=$2 WHERE id = $1;`,
      [vidoeid, updateStatus]
    );
    const insertReviewedData = await client.query(
      `INSERT INTO reviewed_Data (video_id, reviewed_by, rejected_reason) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (video_id) 
     DO UPDATE SET reviewed_by=$2, rejected_reason=$3;`,
      [vidoeid, userdata.id, videostatus || Accepted]
    );
    // Perform the delete operation
    const deleteResult = await client.query(
      `DELETE FROM livewatchvideo WHERE videoid=$1`,
      [vidoeid]
    );

    // If both queries are successful and have valid results, commit the transaction
    if (
      updateResult.rowCount > 0 &&
      deleteResult.rowCount > 0 &&
      insertReviewedData.rowCount > 0
    ) {
      await client.query("COMMIT");
      return true;
    } else {
      await client.query("ROLLBACK");
      return false;
    }
  } catch (error) {
    await client.query("ROLLBACK"); // If any query fails, rollback the transaction
    throw new ErrorHandler(500, "Failed update data");
  } finally {
    client.release(); // Release the client back to the pool
  }
};
