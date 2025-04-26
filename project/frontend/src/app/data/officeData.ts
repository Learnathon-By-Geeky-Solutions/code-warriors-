export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface Office {
  id: string;
  name: string;
  location: string;
  teams: Team[];
  services: Service[];
}

export const offices: Office[] = [
  {
    id: "nyc",
    name: "New York Office",
    location: "New York City, USA",
    teams: [
      {
        id: "nyc-dev",
        name: "NYC Development Team",
        members: ["Alice", "Bob", "Charlie"],
      },
      {
        id: "nyc-design",
        name: "NYC Design Team",
        members: ["Diana", "Ethan", "Fiona"],
      },
    ],
    services: [
      {
        id: "nyc-web-dev",
        name: "Web Development",
        description: "Full-stack web development services",
      },
      {
        id: "nyc-mobile-dev",
        name: "Mobile Development",
        description: "iOS and Android app development",
      },
      {
        id: "nyc-ui-ux",
        name: "UI/UX Design",
        description: "User interface and experience design",
      },
    ],
  },
  {
    id: "ldn",
    name: "London Office",
    location: "London, UK",
    teams: [
      {
        id: "ldn-marketing",
        name: "London Marketing Team",
        members: ["George", "Hannah", "Ian"],
      },
      {
        id: "ldn-sales",
        name: "London Sales Team",
        members: ["Julia", "Kevin", "Liam"],
      },
    ],
    services: [
      {
        id: "ldn-digital-marketing",
        name: "Digital Marketing",
        description: "Comprehensive digital marketing strategies",
      },
      {
        id: "ldn-seo",
        name: "SEO Optimization",
        description: "Search engine optimization services",
      },
      {
        id: "ldn-content",
        name: "Content Creation",
        description: "High-quality content creation for various platforms",
      },
    ],
  },
  {
    id: "tky",
    name: "Tokyo Office",
    location: "Tokyo, Japan",
    teams: [
      {
        id: "tky-research",
        name: "Tokyo Research Team",
        members: ["Mio", "Naoki", "Olivia"],
      },
      {
        id: "tky-support",
        name: "Tokyo Support Team",
        members: ["Ren", "Sakura", "Taro"],
      },
    ],
    services: [
      {
        id: "tky-ai-research",
        name: "AI Research",
        description: "Cutting-edge artificial intelligence research",
      },
      {
        id: "tky-data-analysis",
        name: "Data Analysis",
        description: "Advanced data analysis and visualization",
      },
      {
        id: "tky-tech-support",
        name: "Technical Support",
        description: "24/7 technical support for global clients",
      },
    ],
  },
];
