import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, query, collection, where, orderBy, limit, getDocs } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { User } from "../types";
import { toast } from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  subscription: any | null;
  loading: boolean;
  login: () => Promise<void>;
  guestLogin: () => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guestStatus = localStorage.getItem("isGuest") === "true";
    if (guestStatus) {
      setIsGuest(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setIsGuest(false);
          localStorage.removeItem("isGuest");
          
          // Fetch user doc
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "Anonymous",
              email: firebaseUser.email || "",
              photo: firebaseUser.photoURL || "",
              role: "user",
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }

          // Fetch active subscription
          try {
            const subQuery = query(
              collection(db, "subscriptions"), 
              where("userId", "==", firebaseUser.uid),
              where("status", "==", "active"),
              orderBy("expiresAt", "desc"),
              limit(1)
            );
            const subSnap = await getDocs(subQuery);
            if (!subSnap.empty) {
              const subData = subSnap.docs[0].data();
              if (subData.expiresAt?.toDate() > new Date()) {
                setSubscription({ id: subSnap.docs[0].id, ...subData });
              }
            }
          } catch (subError) {
            console.warn("Subscription fetch failed (might need index):", subError);
          }
        } else {
          setUser(null);
          setSubscription(null);
        }
      } catch (error) {
        console.error("Auth State Change Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in successfully!");
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === "auth/popup-blocked") {
        toast.error("Pop-up blocked! Please allow pop-ups for this site.");
      } else if (error.code === "auth/unauthorized-domain") {
        toast.error("This domain is not authorized in Firebase Console.");
      } else {
        toast.error("Login failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = () => {
    setIsGuest(true);
    localStorage.setItem("isGuest", "true");
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsGuest(false);
      localStorage.removeItem("isGuest");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const isAdmin = user?.role === "admin" || user?.email === "bindhanibikash71@gmail.com";

  return (
    <AuthContext.Provider value={{ user, subscription, loading, login, guestLogin, logout, isAdmin, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
