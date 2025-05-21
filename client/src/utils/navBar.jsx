import React, { useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import "../assets/styles/components.css";
import { useUser } from "./context/userContext";
import { useLocation } from "react-router-dom";

const Navbar = (props) => {
  const location = useLocation();
  const [path, setPath] = React.useState("");
  const { user } = useUser();

  const showProfile = (profileDetails) => {
    const isExist = document.querySelector(".profile-container");
    if (isExist) {
      return;
    }

    const profileContainer = document.createElement("div");
    profileContainer.className = "profile-container";
    const profileInfo = document.createElement("div");
    profileInfo.className = "profile-info";
    Object.keys(user).map(async (detail) => {
      const detailList = document.createElement("li");
      detailList.classList = "detail";
      detailList.innerHTML = `<p><span>${detail}:</span>&nbsp;<span> ${user[detail]}</span></p>`;
      profileInfo.appendChild(detailList);
    });
    profileContainer.appendChild(profileInfo);
    document.body.appendChild(profileContainer);
  };

  useEffect(() => {
    const currentPath = location.pathname.split("/").pop();
    setPath(currentPath);
  }, [location.pathname]);
  useEffect(() => {
    const bodyClick = (event) => {
      const profileExist = document.querySelector(".profile-container");

      if (event.target.closest("li.show-profile")) {
        return;
      } else if (event.target.closest("div.profile-container")) {
        return;
      }

      if (profileExist) {
        profileExist.remove();
      }
    };
    document.body.addEventListener("click", bodyClick);
    return () => {
      document.body.removeEventListener("click", bodyClick);
    };
  }, []);
  return (
    <>
      {/*Top Navigation Bar*/}
      <div>
        <nav className="navbar">
          <div className="logo">
            <h1 style={{ margin: 0 }}>Quizzards</h1>
          </div>
          <div className="nav-links">
            {["home", "admin"].includes(path) && (
              <>
                <span
                  className={props.page === "course" ? "active-nav" : ""}
                  onClick={() => props.setPage("course")}
                >
                  Course
                </span>
                <span
                  className={props.page === "tests" ? "active-nav" : ""}
                  onClick={() => props.setPage("tests")}
                >
                  Tests
                </span>
              </>
            )}

            {path === "admin" && (
              <>
                <span
                  className={props.page === "Users" ? "active-nav" : ""}
                  onClick={() => props.setPage("Users")}
                >
                  Users
                </span>
                <span
                  className={props.page === "Questions" ? "active-nav" : ""}
                  onClick={() => props.setPage("Questions")}
                >
                  Questions
                </span>
              </>
            )}

            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://sanjaikumaran.online/contact/"
            >
              Contact
            </a>
            {!props.showProfile && (
              <li
                onClick={() => {
                  showProfile(props.userData);
                }}
                className="show-profile"
              >
                <CgProfile style={{ fontSize: "1.5rem" }} />
              </li>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};
export default Navbar;
