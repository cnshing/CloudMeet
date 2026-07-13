<script lang="ts">
	import { Alert, Avatar, Button, Card, FormField, Spinner } from '$lib/components/ui';

	interface Props {
		user: {
			name?: string;
			email?: string;
			profile_image?: string | null;
			contact_email?: string | null;
			settings?: string | null;
		} | null;
		onProfileSaved?: () => void;
	}

	let { user, onProfileSaved }: Props = $props();

	// Parse user settings
	function getUserSettings() {
		try {
			return user?.settings ? JSON.parse(user.settings) : {};
		} catch {
			return {};
		}
	}

	// Profile edit state
	let showProfileEdit = $state(false);
	let profileName = $state(user?.name || '');
	let profileImage = $state(user?.profile_image || '');
	let contactEmail = $state(user?.contact_email || '');
	let timeFormat = $state<'12h' | '24h'>(getUserSettings().timeFormat || '12h');
	let savingProfile = $state(false);
	let uploadingImage = $state(false);
	let profileError = $state('');
	let profileSuccess = $state('');

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploadingImage = true;
		profileError = '';

		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetch('/api/profile', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errData = await response.json() as { message?: string };
				throw new Error(errData.message || 'Failed to upload image');
			}

			const result = await response.json() as { imageUrl?: string };
			profileImage = result.imageUrl || '';
			profileSuccess = 'Image uploaded successfully';
			setTimeout(() => profileSuccess = '', 3000);
		} catch (err: any) {
			profileError = err.message || 'Failed to upload image';
		} finally {
			uploadingImage = false;
		}
	}

	async function saveProfile() {
		savingProfile = true;
		profileError = '';
		profileSuccess = '';

		try {
			const response = await fetch('/api/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: profileName,
					profileImage,
					contactEmail,
					timeFormat
				})
			});

			if (!response.ok) {
				const errData = await response.json() as { message?: string };
				throw new Error(errData.message || 'Failed to save profile');
			}

			profileSuccess = 'Profile saved successfully';
			showProfileEdit = false;
			onProfileSaved?.();
		} catch (err: any) {
			profileError = err.message || 'Failed to save profile';
		} finally {
			savingProfile = false;
		}
	}
</script>

<Card class="mb-8">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-lg font-semibold text-foreground">Your Profile</h2>
		<Button
			onclick={() => showProfileEdit = !showProfileEdit}
			variant="ghost"
			class="px-0 py-0 text-sm text-accent hover:text-accent hover:bg-transparent focus:ring-0 focus:ring-offset-0"
		>
			{showProfileEdit ? 'Cancel' : 'Edit Profile'}
		</Button>
	</div>

	{#if showProfileEdit}
		<!-- Edit Mode -->
		<div class="space-y-4">
			{#if profileError}
				<Alert variant="error" class="p-3">
					{profileError}
				</Alert>
			{/if}
			{#if profileSuccess}
				<Alert variant="success" class="p-3">
					{profileSuccess}
				</Alert>
			{/if}

			<div class="flex items-start gap-6">
				<!-- Profile Image Upload -->
				<div class="flex-shrink-0">
					<div class="relative">
						<Avatar src={profileImage} name={profileName} size="lg" alt="Profile" />
						<label class="absolute bottom-0 right-0 bg-surface rounded-full p-2 shadow-lg border border-border cursor-pointer hover:bg-background transition">
							<input
								type="file"
								accept="image/*"
								onchange={handleImageUpload}
								class="hidden"
								disabled={uploadingImage}
							/>
							{#if uploadingImage}
								<Spinner size="sm" />
							{:else}
								<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
								</svg>
							{/if}
						</label>
					</div>
					<p class="text-xs text-subtle-foreground mt-2 text-center">Max 2MB</p>
				</div>

				<!-- Name Input -->
				<div class="flex-1 space-y-4">
					<FormField forId="profile-name" label="Display Name" help="This name will be shown on your booking page">
						<input
							type="text"
							id="profile-name"
							bind:value={profileName}
							class="w-full px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="Your name"
						/>
					</FormField>

					<FormField
						forId="contact-email"
						label="Contact Email"
						help="Business email shown in booking emails. Leave empty to use {user?.email}"
					>
						<input
							type="email"
							id="contact-email"
							bind:value={contactEmail}
							class="w-full px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="your@business-email.com"
						/>
					</FormField>
				</div>
			</div>

			<!-- Time Format -->
			<div class="mt-6">
				<label class="block text-sm font-medium text-muted-foreground mb-3">
					Time Format
				</label>
				<div class="flex gap-3">
					<button
						type="button"
						onclick={() => timeFormat = '12h'}
						class="px-4 py-2 rounded-lg border-2 text-sm font-medium transition {timeFormat === '12h' ? 'border-primary bg-accent-subtle text-foreground' : 'border-border-medium text-muted-foreground hover:border-border-strong'}"
					>
						12-hour (AM/PM)
					</button>
					<button
						type="button"
						onclick={() => timeFormat = '24h'}
						class="px-4 py-2 rounded-lg border-2 text-sm font-medium transition {timeFormat === '24h' ? 'border-primary bg-accent-subtle text-foreground' : 'border-border-medium text-muted-foreground hover:border-border-strong'}"
					>
						24-hour
					</button>
				</div>
				<p class="text-xs text-subtle-foreground mt-2">Choose how times are displayed on your booking page</p>
			</div>

			<div class="flex justify-end mt-6">
				<Button
					onclick={saveProfile}
					disabled={savingProfile}
				>
					{savingProfile ? 'Saving...' : 'Save Profile'}
				</Button>
			</div>
		</div>
	{:else}
		<!-- View Mode -->
		<div class="flex items-center gap-4">
			<Avatar src={user?.profile_image} name={user?.name} alt="Profile" />
			<div>
				<p class="font-semibold text-foreground">{user?.name}</p>
				<p class="text-sm text-muted-foreground">{user?.email}</p>
			</div>
		</div>
	{/if}
</Card>
