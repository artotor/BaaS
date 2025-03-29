import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects, Project } from '../services/projects.service';

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          to="/projects"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          View All Projects
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-500 text-xl font-bold">{projects.length}</div>
            <div className="text-gray-500">Total Projects</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-500 text-xl font-bold">Active</div>
            <div className="text-gray-500">System Status</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-500 text-xl font-bold">PostgreSQL + GraphQL</div>
            <div className="text-gray-500">Technology</div>
          </div>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100"
              >
                <div className="font-bold text-lg">{project.name}</div>
                <div className="text-sm text-gray-500">{project.dbName}</div>
              </Link>
            ))}
          </div>
          {projects.length > 3 && (
            <div className="mt-4 text-center">
              <Link
                to="/projects"
                className="text-blue-500 hover:text-blue-700"
              >
                View all {projects.length} projects
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="mb-4">You don't have any projects yet.</p>
          <Link
            to="/projects"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Your First Project
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 