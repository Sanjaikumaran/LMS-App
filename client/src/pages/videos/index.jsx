
import React, { useEffect, useState } from "react";
import styles from "./course.module.css"; 
import handleApiCall from "../../utils/handleAPI"; 
import Button from "../../utils/button";

const CourseModule = () => {
  const [modules, setModules] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await handleApiCall({
          API: "load-data",
          data: { collection: "CourseModules" },
        });

        if (response.flag) {
          setModules(response.data.data);
        } else {
          console.log("[CourseModule] --> No modules found.");
        }
      } catch (error) {
        console.log(`[CourseModule] --> ${error.message}`);
      }
    };

    fetchModules();
  }, []);

  return (
    <div className={styles.courseContainer}>
      {modules.length === 0 ? (
        <p>No course modules found.</p>
      ) : (
        modules.map((module) => (
          <div key={module._id} className={styles.moduleCard}>
            <h2>{module.title}</h2>
            <p>{module.description}</p>
            <div className={styles.buttonContainer}>
                <Button
                  onClick={() => setPlayingVideo(module.videoUrl)}
                  type="button"
                >
                    Play Video
                </Button>
            </div>
            
        </div>
        ))
      )}

      {playingVideo && (
        <div className={styles.videoPlayer}>
          <video controls autoPlay width="100%">
            <source src={playingVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default CourseModule;
