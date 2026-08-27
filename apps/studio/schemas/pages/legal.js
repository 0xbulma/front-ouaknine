export default {
  name: 'legal',
  title: 'Legal Page',
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
      type: 'string',
      validation: Rule => [
        Rule.required().error('Please set the title'),
      ]
    },
    {
      name: 'block',
      title: 'Body',
      type: 'blockContent',
    },
   
 
  ],

  preview: {
    select: {
      title: 'language',
    }
  },
}