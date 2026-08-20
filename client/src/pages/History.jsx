import { useEffect, useState } from "react";
import axios from "axios";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/history/");

      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Analysis History</h1>

      <div className="bg-[#0f172a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1e293b]">
            <tr>
              <th className="p-4 text-left">Dataset</th>

              <th className="p-4 text-left">Prediction</th>

              <th className="p-4 text-left">Severity</th>

              <th className="p-4 text-left">Confidence</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item) => (
              <tr key={item._id} className="border-b border-slate-700">
                <td className="p-4">{item.datasetName}</td>

                <td className="p-4">{item.prediction}</td>

                <td className="p-4">{item.severity}</td>

                <td className="p-4">{item.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;
