import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { validateUpload } from '../common/media-validation.util';
import type { UploadFile } from '../common/upload-file.type';
import { UpdateArtistProfileDto } from './dto/update-artist-profile.dto';

export interface ContactAction {
  type: 'WHATSAPP' | 'DISCORD';
  label: string;
  url: string;
}

export interface PublicArtistProfile {
  configured: boolean;
  name: string | null;
  bio: string | null;
  presentationText: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  contactActions: ContactAction[];
}

export interface ManageArtistProfile extends PublicArtistProfile {
  artistUserId: string | null;
  whatsappValue: string | null;
  whatsappEnabled: boolean;
  discordUrl: string | null;
  discordEnabled: boolean;
  contactButtonText: string | null;
}

export interface ArtistProfileActor {
  id: string;
  roles: Role[];
}

const artistProfileInclude = {
  avatarMedia: { select: { storageKey: true } },
  bannerMedia: { select: { storageKey: true } },
} as const;

function normalizeWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '');

  return digits.length >= 10 && digits.length <= 15 ? digits : '';
}

@Injectable()
export class ArtistProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Public artist profile, safe for unauthenticated consumption.
   */
  async getPublicProfile(): Promise<PublicArtistProfile> {
    const artist = await this.findActiveArtist();

    if (!artist) {
      return {
        configured: false,
        name: null,
        bio: null,
        presentationText: null,
        avatarUrl: null,
        bannerUrl: null,
        contactActions: [],
      };
    }

    return this.toPublicProfile(artist);
  }

  /**
   * Management profile used by ARTIST and SUPER_ADMIN.
   */
  async getManageProfile(
    actor: ArtistProfileActor,
  ): Promise<ManageArtistProfile> {
    this.assertCanManage(actor);

    const artist = await this.findActiveArtist();

    if (!artist) {
      throw new NotFoundException('No active artist is configured');
    }

    const publicProfile = await this.toPublicProfile(artist);

    return {
      ...publicProfile,
      artistUserId: artist.userId,
      whatsappValue: artist.whatsappValue,
      whatsappEnabled: artist.whatsappEnabled,
      discordUrl: artist.discordUrl,
      discordEnabled: artist.discordEnabled,
      contactButtonText: artist.contactButtonText,
    };
  }

  /**
   * Updates only the allowlisted public profile fields. The active artist or
   * SUPER_ADMIN may update. When a value is rejected, previous data is kept.
   */
  async updateProfile(
    actor: ArtistProfileActor,
    dto: UpdateArtistProfileDto,
  ): Promise<ManageArtistProfile> {
    this.assertCanManage(actor);

    const artist = await this.findActiveArtist();

    if (!artist) {
      throw new NotFoundException('No active artist is configured');
    }

    if (dto.whatsappValue !== undefined && dto.whatsappValue !== null) {
      const normalized = normalizeWhatsApp(dto.whatsappValue);

      if (!normalized) {
        throw new BadRequestException('Invalid WhatsApp number');
      }
    }

    const updated = await this.prisma.artist.update({
      where: { id: artist.id },
      data: {
        name: dto.name,
        bio: dto.bio,
        presentationText: dto.presentationText,
        contactButtonText: dto.contactButtonText,
        whatsappValue:
          dto.whatsappValue === null
            ? null
            : (dto.whatsappValue ?? artist.whatsappValue),
        whatsappEnabled: dto.whatsappEnabled ?? artist.whatsappEnabled,
        discordUrl:
          dto.discordUrl === null
            ? null
            : (dto.discordUrl ?? artist.discordUrl),
        discordEnabled: dto.discordEnabled ?? artist.discordEnabled,
      },
      include: artistProfileInclude,
    });

    return this.toManageProfile(updated);
  }

  /**
   * Uploads an avatar image and updates the profile reference only after the
   * object is stored successfully. Returns the updated manage profile.
   */
  async uploadAvatar(actor: ArtistProfileActor, file: UploadFile) {
    return this.uploadProfileMedia(actor, file, 'avatar');
  }

  async uploadBanner(actor: ArtistProfileActor, file: UploadFile) {
    return this.uploadProfileMedia(actor, file, 'banner');
  }

  private async uploadProfileMedia(
    actor: ArtistProfileActor,
    file: UploadFile,
    kind: 'avatar' | 'banner',
  ): Promise<ManageArtistProfile> {
    this.assertCanManage(actor);

    const validated = validateUpload(file);

    if (validated.kind !== 'IMAGE') {
      throw new BadRequestException('Only image files are accepted');
    }

    const artist = await this.findActiveArtist();

    if (!artist) {
      throw new NotFoundException('No active artist is configured');
    }

    const { storageKey } = await this.storage.upload(file);

    const media = await this.prisma.media.create({
      data: {
        storageKey,
        filename: storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type: 'IMAGE',
        postId: null,
        position: 0,
      },
    });

    const field = kind === 'avatar' ? 'avatarMediaId' : 'bannerMediaId';

    const updated = await this.prisma.artist.update({
      where: { id: artist.id },
      data: { [field]: media.id },
      include: artistProfileInclude,
    });

    return this.toManageProfile(updated);
  }

  private async findActiveArtist() {
    return this.prisma.artist.findFirst({
      where: {
        user: { roles: { some: { role: Role.ARTIST } } },
      },
      include: artistProfileInclude,
    });
  }

  private assertCanManage(actor: ArtistProfileActor) {
    const isAdmin = actor.roles.includes(Role.SUPER_ADMIN);

    if (!isAdmin && !actor.roles.includes(Role.ARTIST)) {
      throw new ForbiddenException(
        'Only ARTIST or SUPER_ADMIN can manage the artist profile',
      );
    }
  }

  private async toPublicProfile(artist: {
    name: string;
    bio: string | null;
    presentationText: string | null;
    contactButtonText: string | null;
    whatsappValue: string | null;
    whatsappEnabled: boolean;
    discordUrl: string | null;
    discordEnabled: boolean;
    avatarMedia: { storageKey: string } | null;
    bannerMedia: { storageKey: string } | null;
  }): Promise<PublicArtistProfile> {
    const [avatarUrl, bannerUrl] = await Promise.all([
      this.mediaUrl(artist.avatarMedia?.storageKey ?? null),
      this.mediaUrl(artist.bannerMedia?.storageKey ?? null),
    ]);

    const contactActions: ContactAction[] = [];

    if (artist.whatsappEnabled && artist.whatsappValue) {
      const digits = normalizeWhatsApp(artist.whatsappValue);

      if (digits) {
        contactActions.push({
          type: 'WHATSAPP',
          label: 'Falar pelo WhatsApp',
          url: `https://wa.me/${digits}`,
        });
      }
    }

    if (artist.discordEnabled && artist.discordUrl) {
      contactActions.push({
        type: 'DISCORD',
        label: 'Entrar em contato pelo Discord',
        url: artist.discordUrl,
      });
    }

    return {
      configured: true,
      name: artist.name,
      bio: artist.bio,
      presentationText: artist.presentationText,
      avatarUrl,
      bannerUrl,
      contactActions,
    };
  }

  private async toManageProfile(artist: {
    userId: string;
    name: string;
    bio: string | null;
    presentationText: string | null;
    contactButtonText: string | null;
    whatsappValue: string | null;
    whatsappEnabled: boolean;
    discordUrl: string | null;
    discordEnabled: boolean;
    avatarMedia: { storageKey: string } | null;
    bannerMedia: { storageKey: string } | null;
  }): Promise<ManageArtistProfile> {
    const publicProfile = await this.toPublicProfile(artist);

    return {
      ...publicProfile,
      artistUserId: artist.userId,
      whatsappValue: artist.whatsappValue,
      whatsappEnabled: artist.whatsappEnabled,
      discordUrl: artist.discordUrl,
      discordEnabled: artist.discordEnabled,
      contactButtonText: artist.contactButtonText,
    };
  }

  private async mediaUrl(storageKey: string | null): Promise<string | null> {
    if (!storageKey) {
      return null;
    }

    try {
      return await this.storage.getUrl(storageKey);
    } catch {
      return null;
    }
  }
}
