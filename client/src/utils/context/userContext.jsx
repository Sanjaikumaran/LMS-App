import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("userData");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      const sanitizedUser = { ...user };

      sanitizedUser["userID"] = sanitizedUser["userID"] || sanitizedUser["_id"];

      delete sanitizedUser["_id"];
      delete sanitizedUser["Password"];

      localStorage.setItem("userData", JSON.stringify(sanitizedUser));
    } else {
      localStorage.removeItem("userData");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
