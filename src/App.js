import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    onSnapshot,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { setLogLevel } from "firebase/app";

// --- ICONS (using SVG for self-containment) ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const PlateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" /><path d="M13.293 8.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L14 10.414V14a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l2-2z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
const HeartIcon = ({ filled, className = "h-6 w-6" }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const SparklesIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm14 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V9h-1a1 1 0 110-2h1V6a1 1 0 011-1zM9 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H7a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" /></svg>;

// --- Firebase Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug');

// --- App ID ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'lunacycle-app';

// --- Authentication Context ---
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const attemptSignIn = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Error signing in:", error);
                await signInAnonymously(auth);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        attemptSignIn();
        return () => unsubscribe();
    }, []);

    const value = { user, loading };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


// --- Cycle Data & Logic ---
const cycleData = {
    menstrual: {
        phaseName: 'Menstrual',
        color: 'bg-rose-100/80 dark:bg-rose-900/80',
        textColor: 'text-rose-800 dark:text-rose-200',
        borderColor: 'border-rose-300 dark:border-rose-700',
        diet: 'Focus on replenishing iron and reducing inflammation. Eat warm, comforting foods.',
        foods: ['Lean red meat', 'Salmon', 'Lentils', 'Spinach', 'Berries', 'Dark chocolate', 'Ginger tea'],
        activities: 'Prioritize rest. Gentle movement can help ease cramps.',
        exercises: ['Restorative Yoga', 'Gentle Walking', 'Stretching', 'Light Pilates'],
        recipes: [
            { id: "warming-lentil-soup", name: "Warming Lentil & Vegetable Soup", ingredients: ["Lentils", "Carrots", "Celery", "Onion", "Spinach", "Turmeric"], instructions: "Sauté vegetables, add lentils and broth, simmer until cooked, stir in spinach." },
            { id: "baked-salmon-broccoli", name: "Baked Salmon with Roasted Broccoli", ingredients: ["Salmon fillet", "Broccoli", "Quinoa", "Lemon", "Olive oil"], instructions: "Roast salmon and broccoli with olive oil and lemon. Serve with cooked quinoa." }
        ]
    },
    follicular: {
        phaseName: 'Follicular',
        color: 'bg-blue-100/80 dark:bg-blue-900/80',
        textColor: 'text-blue-800 dark:text-blue-200',
        borderColor: 'border-blue-300 dark:border-blue-700',
        diet: 'Fuel rising energy with lean protein and support estrogen metabolism.',
        foods: ['Chicken', 'Fish', 'Tofu', 'Quinoa', 'Oats', 'Broccoli', 'Kale', 'Avocado', 'Flaxseeds'],
        activities: 'Energy is increasing. This is a great time for more challenging workouts.',
        exercises: ['Cardio (Running, Cycling)', 'Strength Training', 'HIIT', 'Dancing'],
         recipes: [
            { id: "chicken-quinoa-salad", name: "Grilled Chicken Salad with Quinoa", ingredients: ["Chicken breast", "Quinoa", "Mixed greens", "Avocado", "Broccoli sprouts", "Lemon vinaigrette"], instructions: "Combine ingredients and toss with dressing." },
            { id: "follicular-power-smoothie", name: "Follicular Power Smoothie", ingredients: ["Flaxseeds", "Pumpkin seeds", "Berries", "Spinach", "Protein powder", "Almond milk"], instructions: "Blend all ingredients until smooth." }
        ]
    },
    ovulatory: {
        phaseName: 'Ovulatory',
        color: 'bg-green-100/80 dark:bg-green-900/80',
        textColor: 'text-green-800 dark:text-green-200',
        borderColor: 'border-green-300 dark:border-green-700',
        diet: 'Support egg release with antioxidants and light, vibrant foods.',
        foods: ['Salmon', 'Eggs', 'Berries', 'Spinach', 'Tomatoes', 'Quinoa', 'Sunflower seeds'],
        activities: 'Peak energy and strength. Push for personal bests, but be mindful of joints.',
        exercises: ['Heavy Strength Training', 'HIIT', 'Power Yoga', 'Team Sports'],
         recipes: [
            { id: "antioxidant-berry-salad", name: "Antioxidant Berry Salad with Salmon", ingredients: ["Grilled salmon", "Mixed berries", "Spinach", "Walnuts", "Balsamic glaze"], instructions: "Top spinach with salmon, berries, and walnuts. Drizzle with glaze." },
            { id: "quinoa-veggie-bowl", name: "Quinoa Bowl with Roasted Veggies", ingredients: ["Quinoa", "Bell peppers", "Zucchini", "Carrots", "Sunflower seeds", "Tahini dressing"], instructions: "Roast vegetables, serve over quinoa, top with seeds and dressing." }
        ]
    },
    luteal: {
        phaseName: 'Luteal',
        color: 'bg-yellow-100/80 dark:bg-yellow-900/80',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        diet: 'Stabilize blood sugar and manage PMS with fiber, protein, and magnesium.',
        foods: ['Sweet potatoes', 'Leafy greens', 'Almonds', 'Dark chocolate', 'Salmon', 'Turkey', 'Brown rice'],
        activities: 'Energy wanes. Shift to lower-impact activities and stress relief.',
        exercises: ['Moderate Cardio (Walking, Swimming)', 'Yoga', 'Pilates', 'Stretching'],
        recipes: [
            { id: "sweet-potato-chickpea-bowl", name: "Roasted Sweet Potato & Chickpea Bowl", ingredients: ["Sweet potato", "Chickpeas", "Kale", "Tahini", "Lemon"], instructions: "Roast sweet potato and chickpeas. Serve over kale with a lemon-tahini drizzle." },
            { id: "magnesium-green-smoothie", name: "Magnesium-Rich Green Smoothie", ingredients: ["Spinach", "Banana", "Almond butter", "Pumpkin seeds", "Cocoa powder", "Plant milk"], instructions: "Blend all ingredients until smooth." }
        ]
    }
};

const getPhase = (cycleDay, cycleLength) => {
    const ovulationDay = Math.round(cycleLength / 2);
    if (cycleDay <= 7) return cycleData.menstrual;
    if (cycleDay < ovulationDay) return cycleData.follicular;
    if (cycleDay >= ovulationDay && cycleDay <= ovulationDay + 3) return cycleData.ovulatory;
    return cycleData.luteal;
};

// --- Helper Functions ---
const formatDate = (date) => !date ? '' : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
}
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
const differenceInDays = (date1, date2) => Math.ceil(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

const inspirationalQuotes = [
    "Caring for yourself is not self-indulgence, it is self-preservation.",
    "Listen to your body; it's the wisest friend you have.",
    "Your well-being is a rhythm, not a race. Honor your pace.",
    "Embrace the cycles of your body as a source of strength and wisdom.",
    "Rest and self-care are the foundations of a powerful life."
];

// --- Main App Component ---
function App() {
    const { user, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [view, setView] = useState('home');
    const [theme, setTheme] = useState('light');
    const [showWelcome, setShowWelcome] = useState(false);
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') || 'light';
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');

            const hasSeen = localStorage.getItem('hasSeenWelcomeScreen');
            if (!hasSeen) {
                setShowWelcome(true);
            }
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !userLoading) {
            setTimeout(() => {
                setIsAppReady(true);
            }, 2000); // Ensure splash screen shows for at least 2 seconds
        }
    }, [authLoading, userLoading]);
    
    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
            const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                setUserData(docSnap.exists() ? docSnap.data() : null);
                setUserLoading(false);
            });
            return () => unsubscribe();
        } else if (!authLoading) { 
            setUserData(null);
            setUserLoading(false);
        }
    }, [user, authLoading]);

    // Effect to handle the pulsing gradient background on view change
    useEffect(() => {
        const container = document.getElementById('app-container');
        if (container) {
            container.classList.remove('pulse-animation');
            // void triggers a reflow, which is necessary to restart the animation
            void container.offsetWidth; 
            container.classList.add('pulse-animation');
        }
    }, [view]);

    const handleGetStarted = () => {
        localStorage.setItem('hasSeenWelcomeScreen', 'true');
        setShowWelcome(false);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    if (!isAppReady) {
        return <SplashScreen />;
    }

    if (showWelcome) {
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }

    const renderMainContent = () => {
        if (!user) return <AuthScreen />;
        if (!userData) return <OnboardingScreen />;
        
        const today = new Date();
        const cycleStartDate = userData.lastCycleStart.toDate();
        const cycleLength = userData.avgCycleLength;
        let currentCycleDay = differenceInDays(cycleStartDate, today);
        if (today >= cycleStartDate) {
            currentCycleDay++;
        } else {
            currentCycleDay = -currentCycleDay + 1;
        }

        const phaseInfo = getPhase(currentCycleDay, cycleLength);
        const nextPeriodDate = addDays(cycleStartDate, cycleLength);
        const daysToNextPeriod = differenceInDays(today, nextPeriodDate);

        switch(view) {
            case 'home': return <HomeScreen userData={userData} phaseInfo={phaseInfo} currentCycleDay={currentCycleDay} daysToNextPeriod={daysToNextPeriod} />;
            case 'calendar': return <CalendarScreen userData={userData} />;
            case 'recipes': return <RecipesScreen phaseInfo={phaseInfo} />;
            case 'profile': return <ProfileScreen userData={userData} toggleTheme={toggleTheme} theme={theme} setView={setView} />;
            default: return <HomeScreen userData={userData} phaseInfo={phaseInfo} currentCycleDay={currentCycleDay} daysToNextPeriod={daysToNextPeriod} />;
        }
    };

    return (
        <>
            <style>{`
                .animated-gradient {
                    background: linear-gradient(-45deg, #fce4ec, #f8bbd0, #ffffff, #fce4ec);
                    background-size: 400% 400%;
                }
                .dark .animated-gradient {
                    background: linear-gradient(-45deg, #2c1a2b, #4a1d35, #121212, #2c1a2b);
                    background-size: 400% 400%;
                }
                .pulse-animation {
                    animation: gradient-pulse 10s ease-in-out;
                }
                @keyframes gradient-pulse {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
            <div id="app-container" className="animated-gradient min-h-screen font-sans text-gray-800 dark:text-gray-200">
                <div className="max-w-4xl mx-auto pb-24">
                    {renderMainContent()}
                </div>
                {user && userData && <BottomNav view={view} setView={setView} />}
            </div>
        </>
    );
}

// --- Screens & Components ---

function SplashScreen() {
    const [quote] = useState(inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]);
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 dark:from-rose-900 dark:via-purple-900 dark:to-blue-900 animate-fade-in">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 italic animate-pulse">"{quote}"</h2>
            </div>
        </div>
    );
}

function WelcomeScreen({ onGetStarted }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900 animate-fade-in">
            <div className="text-center max-w-lg">
                <h1 className="text-5xl font-bold text-pink-500 dark:text-pink-400 mb-4">LunaCycle</h1>
                <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8">Your path to better care starts here.</p>
                <button onClick={onGetStarted} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-10 rounded-full transition-transform duration-300 hover:scale-105">
                    Get Started
                </button>
            </div>
        </div>
    );
}


function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-pink-500 dark:text-pink-400 mb-2">Welcome to LunaCycle</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Sync with your natural rhythm.</p>
                <form onSubmit={handleAuth}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400" required />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-pink-500 dark:text-pink-400 hover:underline">
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                </button>
            </div>
        </div>
    );
}

function OnboardingScreen() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '', height: '', weight: '', lastCycleStart: '', avgCycleLength: '28', avgPeriodLength: '5',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        if (!formData.lastCycleStart || !formData.name || !formData.height || !formData.weight) {
            setError('Please fill out all fields.');
            return;
        }
        setError('');
        const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
        try {
            await setDoc(userDocRef, {
                uid: user.uid, email: user.email, name: formData.name,
                height: Number(formData.height), weight: Number(formData.weight),
                lastCycleStart: new Date(formData.lastCycleStart),
                avgCycleLength: Number(formData.avgCycleLength),
                avgPeriodLength: Number(formData.avgPeriodLength),
                notificationsEnabled: true, createdAt: new Date(),
            });
        } catch (err) {
            console.error(err);
            setError('Could not save your profile. Please try again.');
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">You are unique, let's get you set up</h2>
                 {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Jane Doe" className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height & Weight</label>
                        <div className="flex gap-2">
                           <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                           <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Day of Last Period</label>
                        <input type="date" name="lastCycleStart" value={formData.lastCycleStart} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Average Cycle & Period Length (Days)</label>
                         <div className="flex gap-2">
                           <input type="number" name="avgCycleLength" value={formData.avgCycleLength} onChange={handleChange} placeholder="Cycle" className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                           <input type="number" name="avgPeriodLength" value={formData.avgPeriodLength} onChange={handleChange} placeholder="Period" className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                        </div>
                    </div>
                     <button onClick={handleSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors !mt-6">Finish Setup</button>
                </div>
            </div>
        </div>
    );
}

function HomeScreen({ userData, phaseInfo, currentCycleDay, daysToNextPeriod }) {
    const [dailyTip, setDailyTip] = useState('');
    const [isTipLoading, setIsTipLoading] = useState(true);

    useEffect(() => {
        const generateDailyTip = async () => {
            setIsTipLoading(true);
            const prompt = `You are an encouraging wellness coach for a menstrual cycle tracking app called LunaCycle. The user is currently in their ${phaseInfo.phaseName} phase (Day ${currentCycleDay} of her cycle). Provide a short, positive, and actionable tip or affirmation (2-3 sentences) for today. Focus on self-care and well-being. Do not use markdown formatting.`;
            
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                    const text = result.candidates[0].content.parts[0].text;
                    setDailyTip(text);
                } else {
                    setDailyTip("Embrace your energy today and listen to your body's wisdom.");
                }
            } catch (error) {
                console.error("Error generating daily tip:", error);
                setDailyTip("Have a wonderful day. Remember to be kind to yourself.");
            } finally {
                setIsTipLoading(false);
            }
        };

        if (phaseInfo) {
            generateDailyTip();
        }
    }, [phaseInfo, currentCycleDay]);

    return (
        <div className="p-4 animate-fade-in">
            <header className="mb-8 pt-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Good Morning, {userData.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 dark:text-gray-400">{formatDate(new Date())}</p>
            </header>
            
            <div className={`p-6 rounded-2xl shadow-lg mb-8 ${phaseInfo.color} backdrop-blur-sm`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-sm font-bold uppercase ${phaseInfo.textColor}`}>Your current phase</p>
                        <h2 className={`text-4xl font-extrabold ${phaseInfo.textColor}`}>{phaseInfo.phaseName}</h2>
                    </div>
                    <div className="text-right">
                        <p className={`text-lg font-bold ${phaseInfo.textColor}`}>Day {currentCycleDay}</p>
                        <p className={`text-sm ${phaseInfo.textColor}`}>{daysToNextPeriod} days to next period</p>
                    </div>
                </div>
            </div>

            <div className="p-5 rounded-xl border bg-purple-50/80 dark:bg-purple-900/80 backdrop-blur-sm border-purple-200 dark:border-purple-700 mb-8">
                <h3 className="text-xl font-bold mb-2 text-purple-800 dark:text-purple-200 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2" /> Today's Focus
                </h3>
                {isTipLoading ? (
                     <p className="text-gray-600 dark:text-gray-400 italic">Generating your personalized tip...</p>
                ) : (
                     <p className="text-gray-700 dark:text-gray-300">{dailyTip}</p>
                )}
            </div>

            <div className="space-y-6">
                <InsightCard title="Dietary Focus" content={phaseInfo.diet} items={phaseInfo.foods} color="blue" />
                <InsightCard title="Activity Guide" content={phaseInfo.activities} items={phaseInfo.exercises} color="green" />
            </div>
        </div>
    );
}

function InsightCard({ title, content, items, color }) {
    const colors = {
        blue: { bg: 'bg-blue-50/80 dark:bg-blue-900/80', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200' },
        green: { bg: 'bg-green-50/80 dark:bg-green-900/80', border: 'border-green-200 dark:border-green-700', text: 'text-green-800 dark:text-green-200' },
    };
    const cardColor = colors[color] || colors.blue;

    return (
        <div className={`p-5 rounded-xl border ${cardColor.bg} ${cardColor.border} backdrop-blur-sm`}>
            <h3 className={`text-xl font-bold mb-2 ${cardColor.text}`}>{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{content}</p>
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <span key={index} className="bg-white/80 dark:bg-gray-700/80 text-sm font-medium px-3 py-1 rounded-full text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

function CalendarScreen({ userData }) {
    const { user } = useAuth();
    const [date, setDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const lastCycleStartDate = userData.lastCycleStart.toDate();
        const cycleLength = userData.avgCycleLength;
        const periodLength = userData.avgPeriodLength;

        const nextPeriodStartDate = addDays(lastCycleStartDate, cycleLength);
        const ovulationDay = addDays(lastCycleStartDate, Math.round(cycleLength / 2));
        
        let calendarDays = Array(firstDay).fill({ day: null });
        
        for (let i = 1; i <= lastDate; i++) {
            const currentDate = new Date(year, month, i);
            currentDate.setHours(0,0,0,0);

            let cycleDay = differenceInDays(lastCycleStartDate, currentDate);
            if(currentDate >= lastCycleStartDate) cycleDay++; else cycleDay = -cycleDay + 1;

            let dayInfo = {
                day: i,
                isToday: new Date().toDateString() === currentDate.toDateString(),
                phase: getPhase(cycleDay, cycleLength),
                isPredictedPeriod: false,
                isPredictedOvulation: false,
            };

            const nextPeriodEndDate = addDays(nextPeriodStartDate, periodLength - 1);
            if (currentDate >= nextPeriodStartDate && currentDate <= nextPeriodEndDate) {
                dayInfo.isPredictedPeriod = true;
            }

            const ovulationWindowStart = addDays(ovulationDay, -2);
            const ovulationWindowEnd = addDays(ovulationDay, 1);
             if (currentDate >= ovulationWindowStart && currentDate <= ovulationWindowEnd) {
                dayInfo.isPredictedOvulation = true;
            }

            calendarDays.push(dayInfo);
        }
        setDaysInMonth(calendarDays);
    }, [date, userData]);

    const changeMonth = (offset) => setDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() + offset);
        return newDate;
    });

    const handleLogPeriod = async () => {
        const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
        await updateDoc(userDocRef, {
            lastCycleStart: new Date()
        });
        setShowConfirmation(false);
    }
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="p-4 animate-fade-in">
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
                        <h3 className="text-lg font-bold mb-4">Confirm Period Start</h3>
                        <p className="mb-6">Set today as the first day of your new cycle?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowConfirmation(false)} className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-600">Cancel</button>
                            <button onClick={handleLogPeriod} className="px-6 py-2 rounded-lg bg-rose-500 text-white">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-4 pt-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700"><ArrowLeftIcon /></button>
                <h2 className="text-2xl font-bold">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700"><ArrowRightIcon /></button>
            </div>
             <button onClick={() => setShowConfirmation(true)} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 mb-6">
                My Period Started Today
            </button>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {dayNames.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((d, i) => (
                    <div key={i} className={`h-12 flex items-center justify-center rounded-lg text-sm transition-colors relative backdrop-blur-sm ${
                        d.day === null ? '' : 'border'
                    } ${d.isToday ? 'bg-pink-500 text-white font-bold' : d.phase ? `${d.phase.color} ${d.phase.textColor}` : 'bg-white/80 dark:bg-gray-800/80'}`}>
                       {d.day}
                       {d.isPredictedPeriod && <span className="absolute bottom-1 h-1 w-4/5 bg-rose-400 rounded-full"></span>}
                       {d.isPredictedOvulation && <span className="absolute bottom-1 h-1 w-4/5 bg-green-400 rounded-full"></span>}
                    </div>
                ))}
            </div>
             <div className="mt-8 space-y-2 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <h4 className="font-bold mb-2">Legend:</h4>
                <div className="flex items-center"><span className="w-4 h-4 rounded-full mr-2 bg-rose-100 border border-rose-300"></span>Menstrual</div>
                <div className="flex items-center"><span className="w-4 h-4 rounded-full mr-2 bg-blue-100 border border-blue-300"></span>Follicular</div>
                <div className="flex items-center"><span className="w-4 h-4 rounded-full mr-2 bg-green-100 border border-green-300"></span>Ovulatory</div>
                <div className="flex items-center"><span className="w-4 h-4 rounded-full mr-2 bg-yellow-100 border border-yellow-300"></span>Luteal</div>
                <div className="flex items-center"><span className="h-1 w-4 rounded-full mr-2 bg-rose-400"></span>Predicted Period</div>
                <div className="flex items-center"><span className="h-1 w-4 rounded-full mr-2 bg-green-400"></span>Predicted Fertile Window</div>
            </div>
        </div>
    );
}

function RecipesScreen({ phaseInfo }) {
    const { user } = useAuth();
    const allRecipes = Object.values(cycleData).flatMap(p => p.recipes.map(r => ({ ...r, phase: p.phaseName })));
    const [favorites, setFavorites] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState(null);
    const [customIngredients, setCustomIngredients] = useState('');
    const [error, setError] = useState('');
    
    useEffect(() => {
        if(user){
            const favsRef = collection(db, `artifacts/${appId}/users/${user.uid}/favoriteRecipes`);
            const unsubscribe = onSnapshot(favsRef, (snapshot) => {
                const favIds = snapshot.docs.map(doc => doc.id);
                setFavorites(favIds);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleGenerateRecipe = async () => {
        if (!customIngredients) {
            setError("Please enter at least one ingredient.");
            return;
        }
        setIsGenerating(true);
        setError('');
        setGeneratedRecipe(null);

        const prompt = `You are a creative chef for a menstrual cycle tracking app. The user is in their ${phaseInfo.phaseName} phase and wants a recipe using: ${customIngredients}. Generate a simple, healthy recipe suitable for this phase. The response must be JSON.`;
        
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        name: { type: "STRING" },
                        ingredients: { type: "ARRAY", items: { type: "STRING" } },
                        instructions: { type: "STRING" }
                    },
                    required: ["name", "ingredients", "instructions"]
                }
            }
        };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
             if (result.candidates && result.candidates[0].content.parts[0].text) {
                const recipeJson = JSON.parse(result.candidates[0].content.parts[0].text);
                setGeneratedRecipe({
                    ...recipeJson,
                    id: recipeJson.name.replace(/\s+/g, '-').toLowerCase(),
                    phase: phaseInfo.phaseName
                });
            } else {
                setError("Sorry, I couldn't generate a recipe. Please try again.");
            }
        } catch (err) {
            console.error("Recipe generation error:", err);
            setError("An error occurred while generating the recipe.");
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleFavorite = async (recipe) => {
        const favDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/favoriteRecipes`, recipe.id);
        if(favorites.includes(recipe.id)){
             await deleteDoc(favDocRef);
        } else {
            await setDoc(favDocRef, { ...recipe, addedAt: new Date() });
        }
    }

    return (
        <div className="p-4 animate-fade-in">
            <h2 className="text-3xl font-bold mb-2 pt-4">Recipes</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Suggestions for your <span className={`font-semibold ${phaseInfo.textColor}`}>{phaseInfo.phaseName}</span> phase.</p>

            <div className="mb-8 p-5 rounded-xl border bg-green-50/80 dark:bg-green-900/80 backdrop-blur-sm border-green-200 dark:border-green-700">
                <h3 className="text-xl font-bold mb-3 text-green-800 dark:text-green-200 flex items-center">
                   <SparklesIcon className="h-5 w-5 mr-2" /> AI Recipe Generator
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">Have some ingredients? Let AI create a recipe for you!</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={customIngredients} onChange={(e) => setCustomIngredients(e.target.value)} placeholder="e.g., chicken, rice, spinach" className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400" disabled={isGenerating}/>
                    <button onClick={handleGenerateRecipe} disabled={isGenerating} className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center">
                        {isGenerating ? "Generating..." : "Create"}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            
            {isGenerating && <div className="text-center p-4">Creating your recipe...</div>}

            {generatedRecipe && (
                 <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4">Your AI-Generated Recipe ✨</h3>
                    <RecipeCard recipe={generatedRecipe} isFavorite={favorites.includes(generatedRecipe.id)} onToggleFavorite={toggleFavorite} />
                </div>
            )}
            
            <h3 className="text-2xl font-bold mb-4">Phase Favorites</h3>
            <div className="space-y-4">
                {allRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} isFavorite={favorites.includes(recipe.id)} onToggleFavorite={toggleFavorite} />
                ))}
            </div>
        </div>
    );
}

const RecipeCard = ({ recipe, isFavorite, onToggleFavorite }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-4 flex justify-between items-start">
        <div>
            <h3 className="font-bold text-lg">{recipe.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Good for: {recipe.phase}</p>
            <p className="text-sm mt-2"><span className="font-semibold">Ingredients:</span> {Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients}</p>
            <p className="text-sm mt-2"><span className="font-semibold">Instructions:</span> {recipe.instructions}</p>
        </div>
        <button onClick={() => onToggleFavorite(recipe)} className={`${isFavorite ? 'text-pink-500' : 'text-gray-400'}`}>
           <HeartIcon filled={isFavorite} />
        </button>
    </div>
);


function ProfileScreen({ userData, toggleTheme, theme, setView }) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({
        ...userData,
        lastCycleStart: formatDateForInput(userData.lastCycleStart.toDate()),
    });

    const handleDataChange = (e) => {
        const { name, value, type, checked } = e.target;
        if(type === 'checkbox') {
             setEditableData(prev => ({ ...prev, [name]: checked }));
        } else {
             setEditableData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
        try {
            await updateDoc(userDocRef, {
                ...editableData,
                height: Number(editableData.height),
                weight: Number(editableData.weight),
                avgCycleLength: Number(editableData.avgCycleLength),
                avgPeriodLength: Number(editableData.avgPeriodLength),
                lastCycleStart: new Date(editableData.lastCycleStart)
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setView('home');
    };
    
    return (
        <div className="p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6 pt-4">
                <h2 className="text-3xl font-bold">Profile & Settings</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Edit</button>
                )}
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6 space-y-4">
                {isEditing ? (
                    <>
                        <ProfileInput label="Name" name="name" value={editableData.name ?? ''} onChange={handleDataChange} />
                        <ProfileInput label="Email" name="email" value={editableData.email ?? ''} onChange={handleDataChange} disabled />
                        <ProfileInput label="Height (cm)" name="height" type="number" value={editableData.height ?? ''} onChange={handleDataChange} />
                        <ProfileInput label="Weight (kg)" name="weight" type="number" value={editableData.weight ?? ''} onChange={handleDataChange} />
                        <ProfileInput label="Last Period Start" name="lastCycleStart" type="date" value={editableData.lastCycleStart ?? ''} onChange={handleDataChange} />
                        <ProfileInput label="Average Cycle Length" name="avgCycleLength" type="number" value={editableData.avgCycleLength ?? ''} onChange={handleDataChange} />
                        <ProfileInput label="Average Period Length" name="avgPeriodLength" type="number" value={editableData.avgPeriodLength ?? ''} onChange={handleDataChange} />
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Enable Notifications</span>
                            <input type="checkbox" name="notificationsEnabled" checked={editableData.notificationsEnabled ?? false} onChange={handleDataChange} className="form-checkbox h-5 w-5 text-pink-600" />
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setIsEditing(false)} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="font-semibold text-lg">{userData.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">{userData.email}</p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-medium">Theme</span>
                            <button onClick={toggleTheme} className="flex items-center p-2 rounded-full bg-gray-200/50 dark:bg-gray-700/50">
                                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                            </button>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-medium">Notifications</span>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${userData.notificationsEnabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {userData.notificationsEnabled ? 'On' : 'Off'}
                            </span>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Log Out</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const ProfileInput = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50" />
    </div>
);

function BottomNav({ view, setView }) {
    const navItems = [
        { name: 'home', icon: <HomeIcon /> },
        { name: 'calendar', icon: <CalendarIcon /> },
        { name: 'recipes', icon: <PlateIcon /> },
        { name: 'profile', icon: <UserIcon /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-gray-800/70 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex justify-around p-2">
                {navItems.map(item => (
                    <button 
                        key={item.name} 
                        onClick={() => setView(item.name)} 
                        className={`p-3 rounded-full transition-colors duration-300 ${view === item.name ? 'text-pink-500 bg-pink-100 dark:bg-pink-900/50' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        aria-label={item.name}
                    >
                        {item.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Final export for the App
export default function Main() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}
