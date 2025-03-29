import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProjectById, Project } from '../services/projects.service';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await fetchProjectById(parseInt(id, 10));
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg">Loading project...</p>
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

  if (!project) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Project not found.</p>
        <Link to="/projects" className="text-blue-500 hover:underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="space-x-2">
          <a
            href={`/api/projects/${project.id}/playground-acme`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            GraphQL Playground
          </a>
          <Link
            to="/projects"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Projects
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-b pb-2">
            <span className="text-gray-600">Project ID:</span> 
            <span className="ml-2 font-medium">{project.id}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-600">Database Name:</span>
            <span className="ml-2 font-medium">{project.dbName}</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">GraphQL API</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-gray-700 mb-2">Your GraphQL API endpoint:</p>
          <code className="block bg-gray-800 text-white p-2 rounded overflow-x-auto">
            {`/api/projects/${project.id}/graphql`}
          </code>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 