import { useState } from 'react';

export default function AfrivagoLogin() {
  const [email, setEmail] = useState('');

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Left side - Image and benefits */}
      <div className="w-full md:w-1/2 bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md">
          <div className="relative mb-6">
            <img 
              src="/api/placeholder/500/400" 
              alt="Beach illustration" 
              className="rounded-lg"
            />
            <h2 className="text-xl font-bold mt-4 mb-2">Apprêtez-vous à :</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="ml-2">Accéder à nos Prix membres et à nos offres fidélité.</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="ml-2">Reprendre facilement votre recherche à partir n'importe quel appareil.</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="ml-2">Économiser grâce aux alertes de prix sur notre appli.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              <span className="text-green-600">afri</span>
              <span className="text-red-500">va</span>
              <span className="text-amber-500">go</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-1">Économisez plus grâce à votre statut de membre</h2>
            <p className="text-gray-600">Connectez-vous ou créez un compte avec votre e-mail.</p>
          </div>

          <div className="mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="raphaelhenrri57@gmail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Continuer
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">ou continuer avec</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex space-x-2">
            <button className="flex-1 py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50">
              <span className="mr-2">G</span>
              <span>Google</span>
            </button>
            <button className="flex-1 py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50">
              <span className="mr-2">🍎</span>
              <span>Apple</span>
            </button>
            <button className="flex-1 py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50">
              <span className="mr-2">f</span>
              <span>Facebook</span>
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>En créant un compte, vous acceptez notre <a href="#" className="text-blue-500">politique de confidentialité</a> et nos <a href="#" className="text-blue-500">Conditions générales</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}