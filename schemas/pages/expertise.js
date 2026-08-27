export default {
  name: 'expertise',
  title: 'Expertise Page',
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
        Rule.required().error('Please set the language 🍑'),
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
      type: 'string',
      validation: Rule => [
        Rule.required().min(5).error('A description of min. 5 characters is required'),
        Rule.required().max(160).error('A description of max. 60 characters is required 🍆🍑'),
        Rule.max(150).warning('Shorter descriptions are usually better')
      ]
    },
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: Rule => [
        Rule.required().error('Please set the title 😘'),
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
      name: 'titleSection1',
      title: 'Section 1 Title',
      type: 'string',
    },
    {
      name: 'descSection1',
      title: 'Section 1 description',
      type: 'blockContent',
    },
    {
      name: 'expertiseList',
      title: 'List of Expertises',
      type: 'array',
      of: [{type: 'reference', to:[{type:'expertiseItem'}]}],
    },
    {
      name: 'titleSection2',
      title: 'Section 2 Title',
      type: 'string',
    },
    {
      name: 'descSection2',
      title: 'Section 2 description',
      type: 'blockContent',
    },
 
  ],

  preview: {
    select: {
      title: 'language',
    }
  },
}