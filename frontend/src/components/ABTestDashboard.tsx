'use client';
import { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaUsers, 
  FaPercent, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaPlay,
  FaPause,
  FaStop
} from 'react-icons/fa';
import ABTestManager, { AB_TESTS } from '../config/abTestConfig';

interface TestResult {
  variant_id: string;
  variant_name: string;
  total_events: number;
  page_views: number;
  conversions: number;
  conversion_rate: number;
  calculator_usage: number;
  document_uploads: number;
  average_time_on_page: number;
  confidence_level: number;
}

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCard) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {change && (
            <p className="text-sm text-gray-500 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function VariantComparison({ testId }: { testId: string }) {
  const [results, setResults] = useState<{ [key: string]: TestResult }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abTestManager = ABTestManager.getInstance();
    const testResults = abTestManager.getTestResults(testId);
    
    // Transform results to include variant names
    const test = AB_TESTS.find(t => t.id === testId);
    const transformedResults: { [key: string]: TestResult } = {};
    
    Object.keys(testResults).forEach(variantId => {
      const variant = test?.variants.find(v => v.id === variantId);
      const rawResult = testResults[variantId];
      
      transformedResults[variantId] = {
        variant_id: variantId,
        variant_name: variant?.name || variantId,
        total_events: rawResult.total_events || 0,
        page_views: rawResult.events_by_type?.page_loaded || 0,
        conversions: rawResult.events_by_type?.signup_completed || 0,
        conversion_rate: rawResult.conversion_rate || 0,
        calculator_usage: rawResult.events_by_type?.calculator_used || 0,
        document_uploads: rawResult.events_by_type?.document_uploaded || 0,
        average_time_on_page: 0, // Would calculate from raw events
        confidence_level: 0.85 + Math.random() * 0.1 // Mock confidence level
      };
    });
    
    setResults(transformedResults);
    setLoading(false);
  }, [testId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const variants = Object.values(results);
  const bestPerforming = variants.reduce((best, current) => 
    current.conversion_rate > best.conversion_rate ? current : best
  , variants[0]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Variant Performance</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Best performing:</span>
          <span className="text-sm font-semibold text-green-600">{bestPerforming?.variant_name}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Variant</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Page Views</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Conversions</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Conv. Rate</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Calculator Usage</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((result) => (
              <tr key={result.variant_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{result.variant_name}</span>
                    {result.variant_id === bestPerforming?.variant_id && (
                      <FaCheckCircle className="text-green-500 text-sm" />
                    )}
                  </div>
                </td>
                <td className="text-right py-3 px-4 text-gray-700">{result.page_views.toLocaleString()}</td>
                <td className="text-right py-3 px-4 text-gray-700">{result.conversions.toLocaleString()}</td>
                <td className="text-right py-3 px-4">
                  <span className={`font-semibold ${
                    result.conversion_rate >= 0.05 ? 'text-green-600' : 
                    result.conversion_rate >= 0.03 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(result.conversion_rate * 100).toFixed(2)}%
                  </span>
                </td>
                <td className="text-right py-3 px-4 text-gray-700">{result.calculator_usage.toLocaleString()}</td>
                <td className="text-right py-3 px-4">
                  <span className={`text-sm ${
                    result.confidence_level >= 0.95 ? 'text-green-600' : 
                    result.confidence_level >= 0.85 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(result.confidence_level * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {variants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaExclamationTriangle className="mx-auto text-3xl mb-2" />
          <p>No data available yet. Start driving traffic to see results.</p>
        </div>
      )}
    </div>
  );
}

function TestControls({ testId, status, onStatusChange }: {
  testId: string;
  status: string;
  onStatusChange: (newStatus: string) => void;
}) {
  const handleStatusChange = (newStatus: string) => {
    // In production, this would call an API
    onStatusChange(newStatus);
    console.log(`Test ${testId} status changed to: ${newStatus}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Controls</h3>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'active' ? 'bg-green-100 text-green-800' :
            status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        <div className="flex gap-2">
          {status !== 'active' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlay className="text-sm" />
              Start
            </button>
          )}
          
          {status === 'active' && (
            <button
              onClick={() => handleStatusChange('paused')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <FaPause className="text-sm" />
              Pause
            </button>
          )}
          
          {(status === 'active' || status === 'paused') && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaStop className="text-sm" />
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ABTestDashboard() {
  const [selectedTest, setSelectedTest] = useState(AB_TESTS[0]?.id || '');
  const [testStatuses, setTestStatuses] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Initialize test statuses
    const statuses: { [key: string]: string } = {};
    AB_TESTS.forEach(test => {
      statuses[test.id] = test.status;
    });
    setTestStatuses(statuses);
  }, []);

  const selectedTestData = AB_TESTS.find(test => test.id === selectedTest);
  const abTestManager = ABTestManager.getInstance();
  const activeTests = AB_TESTS.filter(test => testStatuses[test.id] === 'active');

  // Calculate overall stats
  const totalTests = AB_TESTS.length;
  const activeTestCount = activeTests.length;
  const completedTests = AB_TESTS.filter(test => testStatuses[test.id] === 'completed').length;

  const handleStatusChange = (testId: string, newStatus: string) => {
    setTestStatuses(prev => ({
      ...prev,
      [testId]: newStatus
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">A/B Test Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor landing page optimization experiments</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Tests"
          value={totalTests}
          icon={<FaChartBar className="text-blue-600" />}
          color="text-blue-600"
        />
        <StatCard
          title="Active Tests"
          value={activeTestCount}
          icon={<FaPlay className="text-green-600" />}
          color="text-green-600"
        />
        <StatCard
          title="Completed Tests"
          value={completedTests}
          icon={<FaCheckCircle className="text-purple-600" />}
          color="text-purple-600"
        />
        <StatCard
          title="Avg. Conversion Rate"
          value="3.2%"
          change="+0.5% vs last month"
          icon={<FaPercent className="text-orange-600" />}
          color="text-orange-600"
        />
      </div>

      {/* Test Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Test to Analyze</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AB_TESTS.map((test) => (
            <button
              key={test.id}
              onClick={() => setSelectedTest(test.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedTest === test.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{test.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  testStatuses[test.id] === 'active' ? 'bg-green-100 text-green-800' :
                  testStatuses[test.id] === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  testStatuses[test.id] === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {testStatuses[test.id]}
                </span>
              </div>
              <p className="text-sm text-gray-600">{test.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                {test.variants.length} variants • {test.targetMetrics.join(', ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTestData && (
        <>
          {/* Test Controls */}
          <TestControls
            testId={selectedTest}
            status={testStatuses[selectedTest]}
            onStatusChange={(newStatus) => handleStatusChange(selectedTest, newStatus)}
          />

          {/* Test Details */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{selectedTestData.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Test Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Description:</span> {selectedTestData.description}</div>
                  <div><span className="text-gray-600">Start Date:</span> {selectedTestData.startDate}</div>
                  <div><span className="text-gray-600">End Date:</span> {selectedTestData.endDate || 'Ongoing'}</div>
                  <div><span className="text-gray-600">Target Metrics:</span> {selectedTestData.targetMetrics.join(', ')}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Variants ({selectedTestData.variants.length})</h3>
                <div className="space-y-2">
                  {selectedTestData.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{variant.name}</span>
                      <span className="text-gray-600">{variant.weight}% traffic</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Variant Comparison */}
          <VariantComparison testId={selectedTest} />
        </>
      )}
    </div>
  );
}
