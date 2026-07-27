import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { getEditorTourSeen, setEditorTourSeen } from '@/lib/editor-tour-prefs';

const TOUR_STEPS = [
  {
    element: '[data-tour="sidebar"]',
    popover: {
      title: 'Trails & items',
      description: 'Organize your project into trails, and add items to each one. Use the "+" buttons to create new ones.',
    },
  },
  {
    element: '[data-tour="editor-title"]',
    popover: {
      title: 'Project title',
      description: 'Double-click to rename your project.',
    },
  },
  {
    element: '[data-tour="write-panel"]',
    popover: {
      title: 'Write',
      description: 'This is where you write and edit the content of the selected item.',
    },
  },
  {
    element: '[data-tour="connections-toggle"]',
    popover: {
      title: 'Connections & graph',
      description: 'Open this panel to link items together and preview them on the knowledge graph.',
    },
  },
  {
    element: '[data-tour="trail-toggle"]',
    popover: {
      title: 'Trail view',
      description: 'Switch to Trail view to read the trail as a narrated sequence.',
    },
  },
  {
    element: '[data-tour="share"]',
    popover: {
      title: 'Share',
      description: 'Control who can see this project and publish it when you\'re ready.',
    },
  },
];

export function useEditorTour(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    getEditorTourSeen()
      .then((seen) => {
        if (cancelled || seen) return;

        const tour = driver({
          showProgress: true,
          skipMissingElement: true,
          steps: TOUR_STEPS,
          onDestroyed: () => setEditorTourSeen(),
        });
        tour.drive();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [ready]);
}
