import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { SupabaseService } from '../supabase/supabase.service'
type UploadedFile = {
  originalname: string
  mimetype: string
  buffer: Buffer
}

@Controller('products')
export class ProductsUploadsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: UploadedFile, @Body('tag') tag?: string) {
    if (!file) throw new BadRequestException('file is required')
    if (!tag) throw new BadRequestException('tag is required')
    // ensure bucket exists
    const { data: buckets } = await this.supabase.admin.storage.listBuckets()
    const hasBucket = (buckets || []).some((b) => b.name === 'products')
    if (!hasBucket) {
      await this.supabase.admin.storage.createBucket('products', { public: true })
    }
    const ext = (file.originalname.split('.').pop() || 'bin').toLowerCase()
    const ts = Math.floor(Date.now() / 1000)
    const path = `${tag}/${ts}.${ext}`
    const { error } = await this.supabase.admin.storage.from('products').upload(path, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: false,
    })
    if (error) throw error
    const pub = this.supabase.admin.storage.from('products').getPublicUrl(path)
    return { url: pub.data.publicUrl, path }
  }
}
