import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useUser } from "../../utils/context/userContext";
import useModal from "../../utils/useModal";

import handleApiCall from "../../utils/handleAPI";

import Input from "../../utils/input";
import Button from "../../utils/button";
import MessageBox from "../../utils/MessageBox";

import styles from "./login.module.css";

const Signin = () => {
  const [responseMessage, setResponseMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const { setUser } = useUser();
  const navigate = useNavigate();

  const { isModalOpen, showModal, Modal } = useModal();

  const navigateTo = useCallback(() => {
    const user = JSON.parse(sessionStorage.getItem("userLogged"));

    navigate(user?.userType === "Admin" ? "/admin" : "/home");
  }, [navigate]);

  const handleLogin = useCallback(async () => {
    const trimmedUserId = userId.trim();
    const trimmedPassword = userPassword.trim();
    const errors = { userId: "", password: "" };

    if (!trimmedUserId || !trimmedPassword) {
      errors.userId = !trimmedUserId ? "Please Enter UserId" : "";
      errors.password = !trimmedPassword ? "Please Enter Password" : "";
      setResponseMessage(errors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await handleApiCall({
        API: "login",
        data: { Id: userId.trim(), userPass: userPassword.trim() },
      });

      if (response?.flag) {
        const userData = response.data.data[0];
        sessionStorage.setItem(
          "userLogged",
          JSON.stringify({ flag: true, userType: userData.userType })
        );
        setUser(userData);
        setResponseMessage("");

        showModal("Info", "Login Successful!", [
          { label: "Ok", shortcut: "Enter", onClick: navigateTo },
        ]);
      } else {
        setResponseMessage(response?.error || "Login failed");
      }
    } catch (error) {
      console.log(`[Signin] --> ${error.message}`);
      setResponseMessage("An error occurred. Please try again.");
    }
    setIsLoading(false);
  }, [userId, userPassword, setUser, showModal, navigateTo]);

  return (
    <>
      <mian className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <h1 className={styles.loginHeader}>Login</h1>
          <div className={styles.loginForm}>
            {/* <div>
            <h1>Jeppiaar University</h1>
          </div> */}
            <div className={styles.inputContainer}>
              <Input
                label="User ID"
                placeHolder="Enter your roll no."
                value={userId}
                error={responseMessage?.userId}
                onChange={(value) => {
                  setResponseMessage(null);
                  setUserId(value);
                }}
                required
                disabled={isLoading}
              />
              <Input
                label="Password"
                type="password"
                placeHolder="Enter your password"
                value={userPassword}
                error={responseMessage?.password}
                onChange={(value) => {
                  setResponseMessage(null);
                  setUserPassword(value);
                }}
                required
                disabled={isLoading}
              />
              {responseMessage && typeof responseMessage === "string" && (
                <MessageBox error={responseMessage} />
              )}
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading || isModalOpen}
              isLoading={isLoading}
              className={styles.loginButton}
              shortcut="Enter"
            >
              Login
            </Button>
          </div>
        </div>
        <section className={styles.sideImg}>
          <div class="quote_box">
            <div class="l-h" id="author_text">
           “Learning gives creativity, creativity leads to thinking, thinking provides knowledge, and knowledge makes you great.”
            </div>
            <h3 class="m-v-sm f-s-14 t-r">
              - <b id="author_name">Dr. APJ Abdul Kalam</b>
            </h3>
          </div>
        </section>
      </mian>

      <Modal />
    </>
  );
};

export default Signin;
