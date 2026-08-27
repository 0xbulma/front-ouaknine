export default {
  name: 'contact',
  title: 'Contact Page',
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
        Rule.required().min(5).error('A title of min. 5 characters is required'),
        Rule.required().max(60).error('A title of max. 60 characters is required 💕💕'),
        Rule.max(50).warning('Shorter titles are usually better')
      ]
    }, {
      name: 'descriptionseo',
      title: 'Description SEO',
      type: 'text',
      validation: Rule => [
        Rule.required().min(5).error('A description of min. 5 characters is required'),
        Rule.required().max(160).error('A description of max. 60 characters is required 😘'),
        Rule.max(150).warning('Shorter descriptions are usually better')
      ]
    },
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: Rule => [
        Rule.required().error('Please set the title'),
      ]
    },
    // {
    //   name: 'subtitle',
    //   title: 'Page SubTitle',
    //   type: 'string',
    // },
    {
      name: 'white',
      title: 'Title Color Black / White',
      type: 'boolean',
      description: "set the title color to black (off) or white (on)"
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
        }
      ]
    },
    {
      name: 'titlebox',
      title: 'Title Contact Box',
      type: 'string',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    },
    {
      name: 'titleform',
      title: 'Title Contact Form',
      type: 'string',
    },
    {
      name: 'subform',
      title: 'Body Contact Form',
      type: 'blockContent',
    },
  ],

  preview: {
    select: {
      title: 'language',
    }
  },
}