import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { time: "12:00", traffic: 120 },
  { time: "12:05", traffic: 300 },
  { time: "12:10", traffic: 180 },
  { time: "12:15", traffic: 500 },
  { time: "12:20", traffic: 250 },
  { time: "12:25", traffic: 700 },
  { time: "12:30", traffic: 400 },
];

function TrafficChart() {

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-6 text-white">
        Real-Time Network Traffic
      </h2>

      <div className="h-[320px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

            <XAxis dataKey="time" stroke="#94a3b8" />

            <YAxis stroke="#94a3b8" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="traffic"
              stroke="#3b82f6"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default TrafficChart;