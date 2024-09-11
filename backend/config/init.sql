-- users Table
CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role_id INT NOT NULL,
   created_at INT DEFAULT EXTRACT(EPOCH FROM NOW()),
    lastSeen INT DEFAULT 0,
     is_Active boolean DEFAULT true,
      FOREIGN KEY (role_id) REFERENCES roles(id)
  );
-- ////////      


-- Roles Table
-- create roleTable
CREATE TYPE "typeOFrole" AS ENUM (
  'RR',
  'MR'
);
  CREATE TABLE IF NOT EXISTS roles (
       id SERIAL PRIMARY KEY,
       role_type typeOFrole,
       role_name VARCHAR(50) UNIQUE NOT NULL
  );

-- insert roleTable  
INSERT INTO roles (role_type,role_name) VALUES ('RR','Reviewer'), ('MR','Manager');

-- ///////

-- liveWatchVideo table
CREATE TABLE liveWatchVideo (id SERIAL PRIMARY KEY,videoid INT UNIQUE NOT NULL,watch_at INT DEFAULT EXTRACT(EPOCH FROM NOW()))
-- /////////

-- reviewed_Data Table
CREATE TABLE reviewed_Data (
  id SERIAL PRIMARY KEY,
  video_id INT UNIQUE NOT NULL,
  reviewed_by INT NOT NULL,
  video_status_update INT DEFAULT EXTRACT(EPOCH FROM NOW())::INT,
  rejected_reason TEXT,
  CONSTRAINT fk_video FOREIGN KEY (video_id) REFERENCES lime_light(id),
  CONSTRAINT fk_user FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
-- //////////
-- tokens
CREATE TABLE verify_tokens(id INT PRIMARY KEY,expirationTime INT,jti TEXT,created_at INT DEFAULT EXTRACT(EPOCH FROM NOW()))
-- ///////

-- ///get video list
SELECT 
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
		lime_light.video_status = 1 and roles.role_type= 'RR' ORDER BY lime_light.created_time;