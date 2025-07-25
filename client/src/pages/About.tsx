
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">À propos de Doualair Blog</h1>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notre Histoire</h2>
              <p className="text-gray-700 mb-6">
                Doualair Blog a été fondé en 2023 avec une passion commune pour l'aéronautique et le partage de connaissances. 
                Notre équipe d'experts et d'enthousiastes s'engage à fournir des articles de qualité sur l'actualité aéronautique, 
                les technologies émergentes et les innovations dans le domaine de l'aviation.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Notre Mission</h2>
              <p className="text-gray-700 mb-6">
                Notre mission est de créer une communauté dynamique autour de l'aéronautique en partageant des informations précises, 
                des analyses approfondies et des récits captivants. Nous croyons en la puissance de l'information pour inspirer et éduquer 
                les passionnés d'aviation du monde entier.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Notre Équipe</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                {[
                  {
                    name: 'Jean Dupont',
                    role: 'Rédacteur en chef',
                    bio: 'Pilote professionnel avec plus de 15 ans d\'expérience dans l\'industrie aéronautique.'
                  },
                  {
                    name: 'Marie Martin',
                    role: 'Journaliste aéronautique',
                    bio: 'Spécialiste des questions techniques et de la sécurité aérienne.'
                  },
                  {
                    name: 'Thomas Leroy',
                    role: 'Photographe aérien',
                    bio: 'Passionné par la photographie aérienne et les reportages en vol.'
                  }
                ].map((member, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 font-medium">{member.role}</p>
                    <p className="mt-2 text-gray-600">{member.bio}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rejoignez Notre Communauté</h2>
                <p className="text-gray-700 mb-6">
                  Que vous soyez un passionné d'aviation, un professionnel du secteur ou simplement curieux, 
                  nous vous invitons à nous rejoindre et à participer à notre communauté en pleine croissance.
                </p>
                <div className="mt-6">
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contactez-nous</h2>
                <p className="text-gray-700">
                  Vous avez des questions ou des suggestions ? N'hésitez pas à nous contacter à l'adresse suivante :
                </p>
                <p className="mt-2 text-blue-600">contact@doualair-blog.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} Doualair Blog. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;