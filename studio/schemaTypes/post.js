// studio/schemas/post.js
// Schema do artigo do blog — chaysouza.com.br

export default {
  name: 'post',
  title: 'Artigo',
  type: 'document',
  fields: [

    // Título
    {
      name: 'titulo',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(100)
        .error('O título é obrigatório e deve ter entre 10 e 100 caracteres'),
    },

    // Slug (URL do artigo)
    {
      name: 'slug',
      title: 'URL do artigo',
      type: 'slug',
      description: 'Gerado automaticamente a partir do título. Ex: como-aparecer-no-google',
      options: {
        source: 'titulo',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
        .error('A URL é obrigatória — clique em "Generate" para criar automaticamente'),
    },

    // Resumo
    {
      name: 'resumo',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      description: 'Aparece nos cards do blog e no Google. Máximo 160 caracteres.',
      validation: Rule => Rule.required().max(160)
        .error('O resumo é obrigatório e deve ter no máximo 160 caracteres'),
    },

    // Imagem de capa
    {
      name: 'imagemCapa',
      title: 'Imagem de capa',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Texto alternativo (SEO)',
          type: 'string',
          description: 'Descreva a imagem para o Google. Ex: Psicóloga no consultório atendendo paciente',
          validation: Rule => Rule.required()
            .error('O texto alternativo é obrigatório para SEO'),
        },
      ],
    },

    // Categoria
    {
      name: 'categoria',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Presença digital',  value: 'presenca-digital' },
          { title: 'Captação',          value: 'captacao' },
          { title: 'Site',              value: 'site' },
          { title: 'Redes sociais',     value: 'redes-sociais' },
          { title: 'Carreira',          value: 'carreira' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required()
        .error('Selecione uma categoria'),
    },

    // Tempo de leitura
    {
      name: 'tempoLeitura',
      title: 'Tempo de leitura (minutos)',
      type: 'number',
      description: 'Ex: 5 (aparece como "5 min de leitura")',
      validation: Rule => Rule.required().min(1).max(60),
    },

    // Data de publicação
    {
      name: 'dataPublicacao',
      title: 'Data de publicação',
      type: 'datetime',
      options: { dateFormat: 'DD/MM/YYYY' },
      initialValue: () => new Date().toISOString(),
    },

    // Conteúdo
    {
      name: 'conteudo',
      title: 'Conteúdo do artigo',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal',    value: 'normal' },
            { title: 'Título H2', value: 'h2' },
            { title: 'Título H3', value: 'h3' },
            { title: 'Destaque', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Negrito',  value: 'strong' },
              { title: 'Itálico', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Abrir em nova aba?',
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        // Imagem dentro do artigo
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
            },
            {
              name: 'caption',
              title: 'Legenda',
              type: 'string',
            },
          ],
        },
      ],
    },

    // Publicado?
    {
      name: 'publicado',
      title: 'Publicado',
      type: 'boolean',
      description: 'Só aparece no site quando estiver marcado como publicado',
      initialValue: false,
    },

  ],

  // Preview no painel
  preview: {
    select: {
      title:    'titulo',
      subtitle: 'categoria',
      media:    'imagemCapa',
    },
    prepare({ title, subtitle, media }) {
      const categorias = {
        'presenca-digital': 'Presença digital',
        'captacao':         'Captação',
        'site':             'Site',
        'redes-sociais':    'Redes sociais',
        'carreira':         'Carreira',
      }
      return {
        title,
        subtitle: categorias[subtitle] || subtitle,
        media,
      }
    },
  },
}