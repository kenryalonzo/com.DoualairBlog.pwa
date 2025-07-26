import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Bienvenue sur Doualair Blog
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Découvrez nos articles et actualités sur l'aéronautique et bien plus
        encore.
      </p>
      <div className="flex gap-4">
        <Link
          to="/sign-in"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Se connecter
        </Link>
        <Link
          to="/sign-up"
          className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
        >
          S'inscrire
        </Link>
      </div>
    </div>
  );
};

export default Home;
