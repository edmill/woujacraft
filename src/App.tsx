import React from 'react';
import { SpriteStabilizer } from './Component';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#ccff00] selection:text-black flex flex-col">
      <style>{`
        :root {
          /* Light Mode Defaults */
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 262.1 83.3% 57.8%; /* Violet-600 */
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 262.1 83.3% 57.8%;
          --radius: 0.5rem;
        }

        .dark {
          /* Dark Mode Overrides */
          --background: 0 0% 3%;
          --foreground: 0 0% 98%;
          --card: 0 0% 6%;
          --card-foreground: 0 0% 98%;
          --popover: 0 0% 6%;
          --popover-foreground: 0 0% 98%;
          --primary: 263.4 70% 50.4%; /* Violet-700 */
          --primary-foreground: 0 0% 100%;
          --secondary: 0 0% 12%;
          --secondary-foreground: 0 0% 98%;
          --muted: 0 0% 12%;
          --muted-foreground: 0 0% 60%;
          --accent: 75 100% 50%; /* Acid Green */
          --accent-foreground: 0 0% 0%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 12%;
          --input: 0 0% 12%;
          --ring: 263.4 70% 50.4%;
        }
      `}</style>
      <div className="flex-1 flex flex-col">
        <SpriteStabilizer />
      </div>
    </div>
  );
}
