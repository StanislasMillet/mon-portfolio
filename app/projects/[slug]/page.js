import { projects } from "../../data";
import ProjectViewer from "./ProjectViewer";
import Model3DViewer from "./Model3DViewer";
import Link from "next/link";
import AboutViewer from "./AboutViewer";

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <p>Projet introuvable.</p>
      </main>
    );
  }
  
  if (project.aboutVideo) {
  return <AboutViewer project={project} />;
}

  if (project.models) {
    return <Model3DViewer project={project} />;
  }

  if (project.sections) {
    return <ProjectViewer project={project} />;
  }

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <Link href="/" className="text-gray-500 hover:text-black">
        ← Retour au carrousel
      </Link>

      <div className="max-w-3xl mx-auto mt-8">
        <img
          src={project.image}
          alt={project.title}
          className="w-full rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
        <p className="text-gray-700">{project.description}</p>
      </div>
    </main>
  );
}