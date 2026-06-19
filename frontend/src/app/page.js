import WeatherDashboard from '../components/WeatherDashboard';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          Atmos
        </h1>
        <p className="text-slate-400 text-lg">Real-time weather insights</p>
      </div>
      
      <WeatherDashboard />
    </main>
  );
}
