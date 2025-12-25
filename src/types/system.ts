export type SystemModule =
  | 'ai-assistant-hub'
  | 'community-center'
  | 'learning-research'
  | 'live-feed'
  | 'pattern-identifier'
  | 'strategy-intelligence'
  | 'ipo-research';

export type NavigationSection = {
  id: string;
  name: string;
  icon: string;
  path: string;
  module: SystemModule;
  subSections?: NavigationSubSection[];
};

export type NavigationSubSection = {
  id: string;
  name: string;
  path: string;
  icon?: string;
};

export type FeatureNode = {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  dependencies: string[];
  module: SystemModule;
};

export type SystemArchitecture = {
  frontend: {
    framework: string;
    routing: string;
    stateManagement: string;
    uiLibrary: string;
    styling: string;
  };
  backend: {
    database: string;
    authentication: string;
    functions: string;
    realtime: string;
  };
  apis: {
    internal: string[];
    external: string[];
  };
};
