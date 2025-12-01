/**
 * Profile Editor
 * Handles member profile creation and editing
 */

const ProfileEditor = {
    currentProfile: null,
    api: null,

    async init() {
        console.log('🔧 Initializing Profile Editor...');
        
        // Initialize API client
        if (typeof NetworkingAPI !== 'undefined') {
            this.api = new NetworkingAPI();
        }
        
        // Check authentication
        const member = window.MembersAuth?.getCurrentMember();
        if (!member) {
            window.location.href = './members.html';
            return;
        }
        
        // Setup form
        this.setupForm();
        this.setupPreview();
        this.setupAvatarUpload();
        
        // Load existing profile
        await this.loadProfile();
        
        // Load badges
        if (window.BadgeSystem) {
            await window.BadgeSystem.init();
            const badgesContainer = document.getElementById('profileBadges');
            if (badgesContainer) {
                window.BadgeSystem.renderBadgeList('profileBadges', { limit: 6 });
            }
        }
        
        console.log('✅ Profile Editor initialized');
    },

    setupForm() {
        const form = document.getElementById('profileForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProfile();
        });
        
        // Bio character counter
        const bioInput = document.getElementById('bioInput');
        const bioCount = document.getElementById('bioCount');
        if (bioInput && bioCount) {
            bioInput.addEventListener('input', () => {
                bioCount.textContent = bioInput.value.length;
            });
        }
        
        // Real-time preview updates
        this.setupLivePreview();
    },

    setupLivePreview() {
        // Display Name
        document.getElementById('displayNameInput')?.addEventListener('input', (e) => {
            document.getElementById('previewName').textContent = e.target.value || 'Your Name';
        });
        
        // Title
        document.getElementById('titleInput')?.addEventListener('input', (e) => {
            document.getElementById('previewTitle').textContent = e.target.value || 'Your Title';
        });
        
        // Location
        document.getElementById('locationInput')?.addEventListener('input', (e) => {
            const text = e.target.value ? `📍 ${e.target.value}` : '📍 Your Location';
            document.getElementById('previewLocation').textContent = text;
        });
        
        // Bio
        document.getElementById('bioInput')?.addEventListener('input', (e) => {
            document.getElementById('previewBio').textContent = e.target.value || 'Your bio will appear here...';
        });
        
        // Interests
        document.querySelectorAll('.interest-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updatePreviewInterests();
            });
        });
    },

    updatePreviewInterests() {
        const interests = this.getSelectedInterests();
        const previewContainer = document.getElementById('previewInterests');
        
        if (interests.length === 0) {
            previewContainer.innerHTML = '';
            return;
        }
        
        previewContainer.innerHTML = interests.map(interest => 
            `<span class="preview-tag">${interest}</span>`
        ).join('');
    },

    setupPreview() {
        // Initialize preview with defaults
        document.getElementById('previewName').textContent = 'Your Name';
        document.getElementById('previewTitle').textContent = 'Your Title';
        document.getElementById('previewLocation').textContent = '📍 Your Location';
        document.getElementById('previewBio').textContent = 'Your bio will appear here...';
    },

    setupAvatarUpload() {
        const avatarInput = document.getElementById('avatarInput');
        if (!avatarInput) return;
        
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file
            if (!file.type.startsWith('image/')) {
                this.showMessage('Please select an image file', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                this.showMessage('Image must be less than 5MB', 'error');
                return;
            }
            
            // Preview image
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                document.getElementById('avatarPreview').src = imageUrl;
                document.getElementById('previewAvatar').src = imageUrl;
            };
            reader.readAsDataURL(file);
        });
    },

    async loadProfile() {
        try {
            const member = window.MembersAuth?.getCurrentMember();
            if (!member) return;
            
            // Set wallet address
            document.getElementById('walletAddress').textContent = member.walletAddress || '0x...';
            document.getElementById('displayName').textContent = member.displayName || 'Set Your Name';
            
            // Try to load from backend API
            if (this.api) {
                try {
                    const profile = await this.api.getProfile();
                    if (profile) {
                        this.populateForm(profile);
                        this.currentProfile = profile;
                        return;
                    }
                } catch (e) {
                    console.log('No existing profile found, creating new one');
                }
            }
            
            // Use default values
            this.populateForm({
                displayName: member.displayName || '',
                walletAddress: member.walletAddress,
                nftCount: member.tokenIds?.length || 0
            });
            
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showMessage('Error loading profile', 'error');
        }
    },

    populateForm(profile) {
        // Basic Info
        if (profile.displayName) {
            document.getElementById('displayNameInput').value = profile.displayName;
            document.getElementById('previewName').textContent = profile.displayName;
        }
        
        if (profile.title) {
            document.getElementById('titleInput').value = profile.title;
            document.getElementById('previewTitle').textContent = profile.title;
        }
        
        if (profile.location) {
            document.getElementById('locationInput').value = profile.location;
            document.getElementById('previewLocation').textContent = `📍 ${profile.location}`;
        }
        
        if (profile.bio) {
            const bioInput = document.getElementById('bioInput');
            bioInput.value = profile.bio;
            document.getElementById('bioCount').textContent = profile.bio.length;
            document.getElementById('previewBio').textContent = profile.bio;
        }
        
        if (profile.industry) {
            document.getElementById('industryInput').value = profile.industry;
        }
        
        // Interests
        if (profile.interests && Array.isArray(profile.interests)) {
            profile.interests.forEach(interest => {
                const checkbox = document.querySelector(`input[value="${interest}"]`);
                if (checkbox) checkbox.checked = true;
            });
            this.updatePreviewInterests();
        }
        
        // Social Links
        if (profile.socials) {
            if (profile.socials.twitter) {
                document.getElementById('twitterInput').value = profile.socials.twitter;
            }
            if (profile.socials.discord) {
                document.getElementById('discordInput').value = profile.socials.discord;
            }
            if (profile.socials.linkedin) {
                document.getElementById('linkedinInput').value = profile.socials.linkedin;
            }
            if (profile.socials.website) {
                document.getElementById('websiteInput').value = profile.socials.website;
            }
        }
        
        // NFT Badge
        const nftCount = profile.nftCount || 0;
        const nftBadge = document.getElementById('nftBadge');
        if (nftCount >= 5) {
            nftBadge.textContent = '🐋 Whale';
        } else if (nftCount >= 3) {
            nftBadge.textContent = '💎 Diamond Hands';
        } else {
            nftBadge.textContent = '💎 Holder';
        }
    },

    async saveProfile() {
        try {
            const saveBtn = document.getElementById('saveButtonText');
            const spinner = document.getElementById('saveButtonSpinner');
            
            // Show loading state
            saveBtn.style.display = 'none';
            spinner.style.display = 'inline';
            
            // Collect form data
            const profileData = {
                displayName: document.getElementById('displayNameInput').value,
                title: document.getElementById('titleInput').value,
                location: document.getElementById('locationInput').value,
                bio: document.getElementById('bioInput').value,
                industry: document.getElementById('industryInput').value,
                interests: this.getSelectedInterests(),
                socials: {
                    twitter: document.getElementById('twitterInput').value,
                    discord: document.getElementById('discordInput').value,
                    linkedin: document.getElementById('linkedinInput').value,
                    website: document.getElementById('websiteInput').value
                },
                settings: {
                    showNFTs: document.getElementById('showNFTs').checked,
                    allowMessages: document.getElementById('allowMessages').checked,
                    showOnline: document.getElementById('showOnline').checked
                }
            };
            
            // Validate
            if (!profileData.displayName) {
                this.showMessage('Display name is required', 'error');
                saveBtn.style.display = 'inline';
                spinner.style.display = 'none';
                return;
            }
            
            // Save to backend API
            if (this.api) {
                try {
                    const result = await this.api.updateProfile(profileData);
                    console.log('Profile saved:', result);
                    this.showMessage('Profile saved successfully! ✅', 'success');
                    
                    // Update member session
                    if (window.MembersAuth) {
                        const member = window.MembersAuth.getCurrentMember();
                        if (member) {
                            member.displayName = profileData.displayName;
                            localStorage.setItem('memberSession', JSON.stringify(member));
                        }
                    }
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = './members.html';
                    }, 2000);
                    
                } catch (apiError) {
                    console.error('API Error:', apiError);
                    // Fallback to localStorage
                    this.saveToLocalStorage(profileData);
                }
            } else {
                // Fallback to localStorage if no API
                this.saveToLocalStorage(profileData);
            }
            
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showMessage('Error saving profile. Please try again.', 'error');
        } finally {
            // Reset button state
            const saveBtn = document.getElementById('saveButtonText');
            const spinner = document.getElementById('saveButtonSpinner');
            saveBtn.style.display = 'inline';
            spinner.style.display = 'none';
        }
    },

    saveToLocalStorage(profileData) {
        localStorage.setItem('memberProfile', JSON.stringify(profileData));
        this.showMessage('Profile saved locally ✅', 'success');
        
        setTimeout(() => {
            window.location.href = './members.html';
        }, 1500);
    },

    getSelectedInterests() {
        const interests = [];
        document.querySelectorAll('.interest-option input[type="checkbox"]:checked').forEach(checkbox => {
            interests.push(checkbox.value);
        });
        return interests;
    },

    showMessage(text, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.message-toast').forEach(toast => toast.remove());
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `message-toast ${type}`;
        toast.textContent = text;
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ProfileEditor.init();
});

// Make available globally
window.ProfileEditor = ProfileEditor;
