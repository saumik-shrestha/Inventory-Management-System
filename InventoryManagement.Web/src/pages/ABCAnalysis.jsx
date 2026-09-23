import { useEffect, useState } from "react";
import api from "../services/api";

function ABCAnalysis() {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/ABCAnalysis");

      console.log("ABC ANALYSIS:", response.data);

      setAnalysis(response.data);
    } catch (error) {
      console.error("ABC Analysis error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Failed to load ABC analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const getClassificationClass = (classification) => {
    if (classification === "A") {
      return "abc-class-a";
    }

    if (classification === "B") {
      return "abc-class-b";
    }

    return "abc-class-c";
  };

  return (
    <div className="abc-page">

      {/* HEADER */}
      <div className="abc-header">

        <div>
          <h1>ABC Analysis</h1>

          <p>
            Analyze inventory based on consumption value.
          </p>
        </div>

        <button
          className="abc-refresh-btn"
          onClick={loadAnalysis}
        >
          Refresh
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="abc-error">
          {error}
        </div>
      )}

      {/* MAIN CARD */}
      <div className="abc-card">

        <div className="abc-card-header">

          <div>
            <h2>Inventory Classification</h2>

            <p>
              {analysis.length} equipment item
              {analysis.length !== 1 ? "s" : ""}
            </p>
          </div>

        </div>

        {/* LOADING */}
        {loading ? (

          <div className="abc-empty">
            Loading ABC analysis...
          </div>

        ) : analysis.length === 0 ? (

          <div className="abc-empty">
            No ABC analysis data available.
          </div>

        ) : (

          <div className="abc-table-wrapper">

            <table className="abc-table">

              <thead>
                <tr>
                  <th>Code</th>
                  <th>Equipment</th>
                  <th>Unit Price</th>
                  <th>Issued Qty</th>
                  <th>Consumption Value</th>
                  <th>%</th>
                  <th>Cumulative %</th>
                  <th>Class</th>
                </tr>
              </thead>

              <tbody>

                {analysis.map((item) => (

                  <tr key={item.equipmentId}>

                    <td>
                      {item.equipmentCode}
                    </td>

                    <td className="abc-equipment-name">
                      {item.equipmentName}
                    </td>

                    <td>
                      {formatCurrency(item.unitPrice)}
                    </td>

                    <td>
                      {item.quantityIssued}
                    </td>

                    <td>
                      {formatCurrency(
                        item.annualConsumptionValue
                      )}
                    </td>

                    <td>
                      {item.percentage.toFixed(2)}%
                    </td>

                    <td>
                      {item.cumulativePercentage.toFixed(2)}%
                    </td>

                    <td>
                      <span
                        className={getClassificationClass(
                          item.classification
                        )}
                      >
                        {item.classification}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* INFORMATION */}
      <div className="abc-info">

        <h3>ABC Classification</h3>

        <div className="abc-info-items">

          <div>
            <span className="abc-class-a">A</span>
            <p>
              High-value inventory requiring close monitoring.
            </p>
          </div>

          <div>
            <span className="abc-class-b">B</span>
            <p>
              Medium-value inventory requiring regular monitoring.
            </p>
          </div>

          <div>
            <span className="abc-class-c">C</span>
            <p>
              Lower-value inventory requiring basic monitoring.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ABCAnalysis;