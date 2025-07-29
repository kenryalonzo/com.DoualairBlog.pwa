import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase'; // Assuming you have initialized Firebase in firebase.ts
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FcGoogle } from "react-icons/fc"; // Import FcGoogle

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      // Send user information to your backend for authentication
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(signInSuccess(data));
        toast.success('Connexion Google réussie !', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate('/dashboard'); // Redirect to dashboard on success
      } else {
        toast.error(data.message || 'Erreur lors de la connexion Google', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

    } catch (error) {
      console.error('Could not sign in with Google', error);
      toast.error('Erreur lors de la connexion Google', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <button
      type='button'
      className='w-full flex items-center justify-center py-3.5 px-6 rounded-lg border-2 border-gray-200/20 bg-white/10 text-gray-300 font-medium hover:bg-white/20 transition-all duration-200 backdrop-blur-sm'
      onClick={handleGoogleClick}
    >
      <FcGoogle className="w-5 h-5 mr-3" />
      <span>Continuer avec Google</span>
    </button>
  );
}