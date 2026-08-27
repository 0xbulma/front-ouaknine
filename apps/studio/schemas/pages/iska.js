export default {
  name: 'iska',
  title: 'ISKA Page',
  type: 'document',
  fields: [
    {
      title: 'Language',
      type: 'string',
      name: 'language',
      options: {
        list: [
          { title: 'Français', value: 'fr' },
          { title: 'English', value: 'en' },
        ],
      },
      validation: Rule => [
        Rule.required().error('Please set the language 😘'),
      ]
    },
    {
      name: 'titleseo',
      title: 'Title SEO',
      type: 'string',
      validation: Rule => [
        Rule.required().min(5).error('A title of min. 5 characters is required 😘'),
        Rule.required().max(60).error('A title of max. 60 characters is required 😘'),
        Rule.max(50).warning('Shorter titles are usually better 😘')
      ]
    }, {
      name: 'descriptionseo',
      title: 'Description SEO',
      type: 'string',
      validation: Rule => [
        Rule.required().min(5).error('A description of min. 5 characters is required 😘'),
        Rule.required().max(160).error('A description of max. 60 characters is required 😘'),
        Rule.max(150).warning('Shorter descriptions are usually better 😘')
      ]
    },
    {
      name: 'title',
      title: 'Page Title',
      description: 'Not displayed: the page opens on the ISKA wordmark, and this is its alt text',
      type: 'string',
      validation: Rule => [
        Rule.required().error('Please set the title'),
      ]
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      rows: 3,
    },
    {
      name: 'cta',
      title: 'Link Label',
      description: 'The button out to iska-avocats.fr',
      type: 'string',
    },
    {
      name: 'ctaAria',
      title: 'Link Description',
      description: 'Read aloud by screen readers in place of the label. Say that the link opens a new tab',
      type: 'string',
    },
    {
      name: 'networkTitle',
      title: 'Section 01 Title',
      type: 'string',
    },
    {
      name: 'network',
      title: 'Section 01 Body',
      type: 'blockContent',
    },
    {
      name: 'bringTitle',
      title: 'Section 02 Title',
      type: 'string',
    },
    {
      name: 'bring',
      title: 'Section 02 Body',
      type: 'blockContent',
    },
    {
      name: 'skillsTitle',
      title: 'Section 03 Title',
      type: 'string',
    },
    {
      name: 'skills',
      title: 'Section 03 Practice Areas',
      description: 'Rendered as wrapped micro-caps, so keep each one short',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],

  preview: {
    select: {
      title: 'language',
    }
  },
}
