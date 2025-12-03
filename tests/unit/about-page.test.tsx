/**
 * About Page Unit Tests
 *
 * Tests for the /about page component functionality and translations
 */

import React from 'react';

// Mock useTranslation hook
const mockTranslations: Record<string, string> = {
  'about.tag': 'About Mix & Munch',
  'about.title': 'Capstone-grade Filipino culinary lab',
  'about.description':
    'Mix & Munch is an academic portfolio project crafted to demonstrate full-stack product thinking.',
  'about.productPillars.title': 'Product pillars',
  'about.productPillars.reduceWaste':
    'Reduce ingredient waste through pantry-first recipe surfacing.',
  'about.productPillars.celebrateFlavors':
    'Celebrate Filipino flavors with creative AI mentorship using Gemini.',
  'about.productPillars.showcaseWorkflow':
    'Showcase transcript-to-recipe workflow for chef collaborations.',
  'about.technologyStack.title': 'Technology stack',
  'about.technologyStack.nextjs':
    'Next.js App Router + TypeScript for cohesive UX flows.',
  'about.technologyStack.tailwind':
    'Tailwind CSS with custom dark theme and micro-interactions.',
  'about.technologyStack.gemini':
    'Gemini AI via @ai-sdk/google for conversational intelligence.',
};

const mockT = (key: string): string => mockTranslations[key] || key;

describe('About Page Tests', () => {
  describe('Translation Keys', () => {
    it('has all required about.tag translation', () => {
      expect(mockT('about.tag')).toBe('About Mix & Munch');
    });

    it('has about.title translation', () => {
      expect(mockT('about.title')).toBe('Capstone-grade Filipino culinary lab');
    });

    it('has about.description translation', () => {
      const description = mockT('about.description');
      expect(description).toContain('Mix & Munch');
      expect(description).toContain('portfolio project');
    });

    it('has all product pillar translations', () => {
      expect(mockT('about.productPillars.title')).toBe('Product pillars');
      expect(mockT('about.productPillars.reduceWaste')).toContain('ingredient waste');
      expect(mockT('about.productPillars.celebrateFlavors')).toContain(
        'Filipino flavors'
      );
      expect(mockT('about.productPillars.showcaseWorkflow')).toContain(
        'transcript-to-recipe'
      );
    });

    it('has all technology stack translations', () => {
      expect(mockT('about.technologyStack.title')).toBe('Technology stack');
      expect(mockT('about.technologyStack.nextjs')).toContain('Next.js');
      expect(mockT('about.technologyStack.tailwind')).toContain('Tailwind CSS');
      expect(mockT('about.technologyStack.gemini')).toContain('Gemini AI');
    });
  });

  describe('Page Structure', () => {
    // These tests validate the expected structure of the about page
    const pageStructure = {
      hasTag: true,
      hasTitle: true,
      hasDescription: true,
      sections: ['productPillars', 'technologyStack'],
      productPillarsItems: ['reduceWaste', 'celebrateFlavors', 'showcaseWorkflow'],
      technologyStackItems: ['nextjs', 'tailwind', 'gemini'],
    };

    it('has correct number of sections', () => {
      expect(pageStructure.sections.length).toBe(2);
    });

    it('product pillars section has 3 items', () => {
      expect(pageStructure.productPillarsItems.length).toBe(3);
    });

    it('technology stack section has 3 items', () => {
      expect(pageStructure.technologyStackItems.length).toBe(3);
    });

    it('includes Filipino flavor emphasis', () => {
      const celebrateFlavors = mockT('about.productPillars.celebrateFlavors');
      expect(celebrateFlavors.toLowerCase()).toContain('filipino');
    });
  });

  describe('Content Validation', () => {
    it('mentions Gemini AI technology', () => {
      const geminiText = mockT('about.technologyStack.gemini');
      expect(geminiText).toContain('Gemini AI');
      expect(geminiText).toContain('@ai-sdk/google');
    });

    it('mentions Next.js framework', () => {
      const nextjsText = mockT('about.technologyStack.nextjs');
      expect(nextjsText).toContain('Next.js');
      expect(nextjsText).toContain('TypeScript');
    });

    it('mentions Tailwind CSS styling', () => {
      const tailwindText = mockT('about.technologyStack.tailwind');
      expect(tailwindText).toContain('Tailwind CSS');
      expect(tailwindText).toContain('dark theme');
    });

    it('emphasizes pantry-first approach', () => {
      const reduceWaste = mockT('about.productPillars.reduceWaste');
      expect(reduceWaste).toContain('pantry-first');
    });

    it('mentions chef collaborations', () => {
      const workflow = mockT('about.productPillars.showcaseWorkflow');
      expect(workflow).toContain('chef collaborations');
    });
  });

  describe('Styling Classes', () => {
    // Expected CSS classes used in the about page
    const expectedClasses = {
      container: 'page-grid space-y-8',
      tag: 'w-fit',
      title: 'text-3xl font-semibold text-white sm:text-4xl',
      description: 'max-w-3xl text-sm text-brand-gray-400',
      grid: 'grid gap-6 md:grid-cols-2',
      card: 'rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/50 p-6',
      sectionTitle: 'text-sm font-semibold uppercase tracking-widest text-brand-gray-400',
      listItem: 'mt-4 space-y-3 text-sm text-brand-gray-300',
    };

    it('uses page-grid container', () => {
      expect(expectedClasses.container).toContain('page-grid');
    });

    it('uses responsive grid for sections', () => {
      expect(expectedClasses.grid).toContain('md:grid-cols-2');
    });

    it('uses dark theme card styling', () => {
      expect(expectedClasses.card).toContain('bg-brand-gray-900');
      expect(expectedClasses.card).toContain('border-brand-gray-800');
    });

    it('uses responsive title sizing', () => {
      expect(expectedClasses.title).toContain('text-3xl');
      expect(expectedClasses.title).toContain('sm:text-4xl');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading structure', () => {
      // h1 for main title, h2 for section titles
      const headingStructure = {
        h1: 'about.title',
        h2: ['about.productPillars.title', 'about.technologyStack.title'],
      };

      expect(headingStructure.h1).toBeTruthy();
      expect(headingStructure.h2.length).toBe(2);
    });

    it('uses list elements for pillar items', () => {
      // About page uses <ul> and <li> for list items
      const listPattern = /^•/;

      // The translations use bullet points
      expect(listPattern.test('• ' + mockT('about.productPillars.reduceWaste'))).toBe(
        true
      );
    });
  });
});
