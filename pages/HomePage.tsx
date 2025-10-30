import React from 'react';
import { Page } from '../types';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-brand-gray-900 p-6 rounded-lg shadow-lg text-center transform transition-transform hover:-translate-y-2">
    <div className="flex justify-center items-center mb-4">
      <div className="bg-brand-lime bg-opacity-20 p-3 rounded-full">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2 text-brand-lime">{title}</h3>
    <p className="text-brand-gray-200">{description}</p>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  const CheckIcon = <svg className="w-8 h-8 text-brand-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
  const ChatIcon = <svg className="w-8 h-8 text-brand-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>;
  const CalendarIcon = <svg className="w-8 h-8 text-brand-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
  const ShoppingCartIcon = <svg className="w-8 h-8 text-brand-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
  
  return (
    <div className="space-y-16">
      <section className="text-center py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          What's in your pantry? Let's cook!
        </h1>
        <p className="text-xl text-brand-gray-200 mb-8 max-w-3xl mx-auto">
          Turn your ingredients into delicious Filipino meals with <span className="text-brand-lime font-bold">Mix & Munch</span>, your AI-powered cooking companion.
        </p>
        <button
          onClick={() => setCurrentPage('demo')}
          className="bg-brand-lime text-brand-gray-900 font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105 shadow-lg"
        >
          Start Cooking Now
        </button>
      </section>

      <section>
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={CheckIcon}
            title="Pantry Matching"
            description="Select ingredients you have, and instantly see matching Filipino recipes with match scores."
          />
          <FeatureCard 
            icon={ChatIcon}
            title="AI Gemini Chatbot"
            description="Ask for recipe suggestions, variations, or cooking tips from our friendly AI chef."
          />
          <FeatureCard 
            icon={CalendarIcon}
            title="Interactive Meal Planner"
            description="Plan your weekly meals by adding recipes directly to your personal calendar."
          />
          <FeatureCard 
            icon={ShoppingCartIcon}
            title="Automatic Shopping List"
            description="Your shopping list is automatically created based on your meal plan."
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;