import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize state based on localStorage values
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("isAuthenticated") === "true");
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");

    useEffect(() => {
        console.log("isAdmin updated to:", isAdmin); // This will log whenever isAdmin changes
    }, [isAdmin]);

    const login = (userData) => {
        console.log(userData);
        setIsAuthenticated(true);
        setUser(userData);
        setIsAdmin(userData.isAdmin); // Update based on the isAdmin flag from the response

        // Update localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("isAdmin", userData.isAdmin ? "true" : "false");

        console.log("isAdmin after login", isAdmin);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false); // Reset isAdmin on logout

        // Clear localStorage
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");
        localStorage.removeItem("isAdmin");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
