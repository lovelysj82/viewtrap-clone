import OpenAI from 'openai'
// OpenAI service for content optimization

export class OpenAIService {
  private static instance: OpenAIService
  private client: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required')
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService()
    }
    return OpenAIService.instance
  }

  async generateTitleRecommendations(
    originalTitle: string,
    description?: string,
    tags?: string[],
    category?: string
  ): Promise<string[]> {
    try {
      const prompt = `
당신은 YouTube 콘텐츠 최적화 전문가입니다. 다음 정보를 바탕으로 더 매력적이고 클릭률이 높은 제목을 5개 제안해주세요.

원본 제목: ${originalTitle}
${description ? `설명: ${description.substring(0, 200)}...` : ''}
${tags ? `태그: ${tags.join(', ')}` : ''}
${category ? `카테고리: ${category}` : ''}

조건:
1. 한국어로 작성
2. 60자 이내
3. 클릭률을 높일 수 있는 키워드 포함
4. 감정을 자극하는 표현 사용
5. 숫자나 특수문자 적절히 활용

각 제목은 줄바꿈으로 구분해서 제공해주세요.
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.8,
      })

      const content = response.choices[0]?.message?.content || ''
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5)
    } catch (error) {
      console.error('Error generating title recommendations:', error)
      throw new Error('Failed to generate title recommendations')
    }
  }

  async generateDescriptionRecommendations(
    originalDescription: string,
    title: string,
    tags?: string[]
  ): Promise<string[]> {
    try {
      const prompt = `
YouTube 비디오 설명을 최적화해주세요. 다음 정보를 바탕으로 더 효과적인 설명을 3개 제안해주세요.

제목: ${title}
원본 설명: ${originalDescription.substring(0, 500)}...
${tags ? `태그: ${tags.join(', ')}` : ''}

조건:
1. 한국어로 작성
2. SEO에 최적화된 키워드 포함
3. 시청자의 관심을 끌 수 있는 구성
4. 적절한 해시태그 포함
5. 1000자 이내

각 설명은 "---" 로 구분해서 제공해주세요.
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content || ''
      return content.split('---').filter(desc => desc.trim().length > 0).slice(0, 3)
    } catch (error) {
      console.error('Error generating description recommendations:', error)
      throw new Error('Failed to generate description recommendations')
    }
  }

  async generateTagRecommendations(
    title: string,
    description?: string,
    existingTags?: string[]
  ): Promise<string[]> {
    try {
      const prompt = `
YouTube 비디오의 태그를 최적화해주세요. 다음 정보를 바탕으로 효과적인 태그를 15개 제안해주세요.

제목: ${title}
${description ? `설명: ${description.substring(0, 300)}...` : ''}
${existingTags ? `기존 태그: ${existingTags.join(', ')}` : ''}

조건:
1. 한국어와 영어 혼합
2. 검색량이 높은 키워드 위주
3. 롱테일 키워드 포함
4. 관련성 높은 태그들로 구성
5. 쉼표로 구분하여 한 줄로 제공

태그들:
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.6,
      })

      const content = response.choices[0]?.message?.content || ''
      return content.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).slice(0, 15)
    } catch (error) {
      console.error('Error generating tag recommendations:', error)
      throw new Error('Failed to generate tag recommendations')
    }
  }

  async analyzeTrendingKeywords(videos: { title: string }[]): Promise<string[]> {
    try {
      const titles = videos.map(v => v.title).join('\n')
      
      const prompt = `
다음은 현재 트렌딩 중인 YouTube 비디오들의 제목입니다. 이를 분석하여 현재 인기있는 키워드와 트렌드를 파악해주세요.

제목들:
${titles}

조건:
1. 자주 등장하는 키워드 추출
2. 트렌드성 있는 키워드 식별
3. 한국어 키워드 위주
4. 20개 이내로 제한
5. 쉼표로 구분하여 한 줄로 제공

트렌딩 키워드:
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.5,
      })

      const content = response.choices[0]?.message?.content || ''
      return content.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0).slice(0, 20)
    } catch (error) {
      console.error('Error analyzing trending keywords:', error)
      throw new Error('Failed to analyze trending keywords')
    }
  }

  async generateContentIdeas(niche: string, targetAudience: string): Promise<string[]> {
    try {
      const prompt = `
다음 조건에 맞는 YouTube 콘텐츠 아이디어를 10개 제안해주세요.

분야: ${niche}
타겟 오디언스: ${targetAudience}

조건:
1. 한국 시청자에게 어필할 수 있는 내용
2. 트렌드에 맞는 주제
3. 클릭률이 높을 것으로 예상되는 제목
4. 실현 가능한 콘텐츠
5. 각 아이디어는 줄바꿈으로 구분

콘텐츠 아이디어:
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.8,
      })

      const content = response.choices[0]?.message?.content || ''
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 10)
    } catch (error) {
      console.error('Error generating content ideas:', error)
      throw new Error('Failed to generate content ideas')
    }
  }

  async scoreTitle(title: string): Promise<number> {
    try {
      const prompt = `
다음 YouTube 제목을 1-10점으로 평가해주세요. 클릭률, 검색 최적화, 매력도를 종합적으로 고려하여 점수만 숫자로 답해주세요.

제목: ${title}

점수:
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      })

      const content = response.choices[0]?.message?.content || '5'
      const score = parseFloat(content.replace(/[^0-9.]/g, ''))
      return isNaN(score) ? 5 : Math.min(Math.max(score, 1), 10)
    } catch (error) {
      console.error('Error scoring title:', error)
      return 5
    }
  }
}