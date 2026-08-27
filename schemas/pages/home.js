export default {
  name: 'home',
  title: 'Home Page',
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
      validation: Rule => [Rule.required().error('Please set the language')],
    },
    {
      name: 'titleseo',
      title: 'Title SEO',
      type: 'string',
      validation: Rule => [
        Rule.required()
          .min(5)
          .error('A title of min. 5 characters is required 💕💕'),
        Rule.required()
          .max(60)
          .error('A title of max. 60 characters is required'),
        Rule.max(50).warning('Shorter titles are usually better'),
      ],
    },
    {
      name: 'descriptionseo',
      title: 'Description SEO',
      type: 'string',
      validation: Rule => [
        Rule.required()
          .min(5)
          .error('A description of min. 5 characters is required'),
        Rule.required()
          .max(160)
          .error('A description of max. 60 characters is required💕💕'),
        Rule.max(150).warning('Shorter descriptions are usually better'),
      ],
    },
    {
      name: 'title1',
      title: 'Page Title Line 1',
      type: 'string',
      validation: Rule => [Rule.required().error('Please set the title 😘')],
    },
    {
      name: 'title2',
      title: 'Page Title Line 2',
      type: 'string',
      validation: Rule => [Rule.required().error('Please set the title 😘')],
    },
    {
      name: 'white',
      title: 'Title Color Black / White',
      type: 'boolean',
      description: 'set the title color to black (off) or white (on)',
    },
    {
      name: 'tag1',
      title: 'Tag 1',
      type: 'string',
    },
    {
      name: 'link1',
      title: 'Link 1',
      type: 'reference',
      to: [{ type: 'expertiseItem' }],
    },
    {
      name: 'tag2',
      title: 'Tag 2',
      type: 'string',
    },
    {
      name: 'link2',
      title: 'Link 2',
      type: 'reference',
      to: [{ type: 'expertiseItem' }],
    },
    {
      name: 'tag3',
      title: 'Tag 3',
      type: 'string',
    },
    {
      name: 'link3',
      title: 'Link 3',
      type: 'reference',
      to: [{ type: 'expertiseItem' }],
    },
    {
      name: 'imageTitle',
      title: 'Title Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Image Title Alt',
        },
      ],
    },
    {
      name: 'sectionTitle',
      title: 'Bottom Section Title',
      type: 'string',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    },
    {
      name: 'mainImage',
      title: 'Profile picture',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'title',
          type: 'string',
          title: 'Image Title',
        },
      ],
    },
  ],

  preview: {
    select: {
      title: 'language',
    },
  },
};
