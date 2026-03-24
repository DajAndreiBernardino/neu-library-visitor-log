import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("student");

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);

    // Check Firestore adminEmails collection
    const adminSnap = await getDoc(doc(db, "adminEmails", u.email));
    const isAdmin = adminSnap.exists();

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: u.uid,
        email: u.email,
        name: u.displayName,
        photoURL: u.photoURL,
        role: isAdmin ? "admin" : "student",
        createdAt: serverTimestamp(),
      });
    } else {
      if (isAdmin) await setDoc(ref, { role: "admin" }, { merge: true });
    }

    const updated = await getDoc(ref);
    const role = updated.data()?.role || "student";
    setActiveRole(role);
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setActiveRole("student");
  };

  const switchToAdmin = () => setActiveRole("admin");
  const switchToVisitor = () => setActiveRole("student");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const profile = snap.data();
          setUser(u);
          setUserProfile(profile);
          setActiveRole(profile.role || "student");
        } else {
          setUser(u);
          setUserProfile({ role: "student" });
          setActiveRole("student");
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setActiveRole("student");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, activeRole, signInWithGoogle, logout, switchToAdmin, switchToVisitor }}
    >
      {children}
    </AuthContext.Provider>
  );
}