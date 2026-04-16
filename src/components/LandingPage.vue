<script setup>

</script>

<template>
  <div>
    

    <!-- Hero Section - More Exciting -->
    <v-container fluid class="hero-bg text-center py-20">
      <v-row justify="center" align="center">
        <v-col cols="12" md="10" lg="8">
          <div class="mb-6">
            <span class="text-caption font-weight-bold text-secondary">CAMPUS • LOST • FOUND</span>
          </div>
          
          <h1 class="text-h1 font-weight-bold text-secondary mb-6 leading-tight">
            Never Lose It<br>
            <span class="text-secondary">On Campus Again</span>
          </h1>

          <p class="text-h5 text-grey-darken-2 mb-10 max-w-800 mx-auto">
            The smartest lost and found platform made for students. 
            Post what you lost. Report what you found. Get it back faster.
          </p>

          <div class="d-flex justify-center gap-4">
            <v-btn 
              to="/login" 
              color="secondary" 
              size="x-large" 
              rounded 
              class="px-10 text-none font-weight-medium"
            >
              Start Now - It's Free
            </v-btn>
            
            <v-btn 
              to="/about" 
              variant="outlined" 
              size="x-large" 
              rounded 
              class="px-10 text-none"
            >
              Learn How It Works
            </v-btn>
          </div>

          <div class="mt-12 text-body-2 text-grey-darken-1">
            Trusted by students at universities across Kenya
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Quick Stats / Trust Bar -->
    <v-container class="py-8 bg-white">
      <v-row justify="center" class="text-center">
        <v-col cols="4" sm="2">
          <h3 class="text-h4 font-weight-bold text-secondary">500+</h3>
          <p class="text-caption">Items Returned</p>
        </v-col>
        <v-col cols="4" sm="2">
          <h3 class="text-h4 font-weight-bold text-secondary">1.2k</h3>
          <p class="text-caption">Students Joined</p>
        </v-col>
        <v-col cols="4" sm="2">
          <h3 class="text-h4 font-weight-bold text-secondary">24h</h3>
          <p class="text-caption">Average Return Time</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Features Section -->
    <v-container class="py-16">
      <v-row justify="center" class="text-center mb-12">
        <v-col cols="12">
          <h2 class="text-h4 font-weight-bold text-secondary">How CampusFind Works</h2>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" md="4" class="text-center px-8">
          <div class="mb-6">
            <v-icon size="80" color="secondary">mdi-help-circle</v-icon>
          </div>
          <h3 class="text-h5 mb-3">Lost Something?</h3>
          <p class="text-grey-darken-1">Post your lost item with private details only admins can see.</p>
        </v-col>

        <v-col cols="12" md="4" class="text-center px-8">
          <div class="mb-6">
            <v-icon size="80" color="secondary">mdi-package-check</v-icon>
          </div>
          <h3 class="text-h5 mb-3">Found Something?</h3>
          <p class="text-grey-darken-1">Take a photo, post it publicly, and help reunite it with its owner.</p>
        </v-col>

        <v-col cols="12" md="4" class="text-center px-8">
          <div class="mb-6">
            <v-icon size="80" color="secondary">mdi-shield-check</v-icon>
          </div>
          <h3 class="text-h5 mb-3">Secure &amp; Verified</h3>
          <p class="text-grey-darken-1">Admin reviews every claim using private information for safety.</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Call to Action -->
    <v-container fluid class="py-16 text-center bg-grey-lighten-4">
      <h2 class="text-h4 font-weight-bold text-secondary mb-6">
        Ready to find what you lost?
      </h2>
      <v-btn 
        to="/login" 
        color="secondary" 
        size="x-large" 
        rounded 
        class="px-12"
      >
        Join CampusFind Today
      </v-btn>
    </v-container>
  </div>
 <v-container fluid class="bg-primary text-center py-4 text-black">
  &copy; 2026 CampusFind. Design by Campus Designs
</v-container>


</template>

<style scoped>
.hero-bg {
  background: linear-gradient(135deg, #d6fbfc 0%, #e0f7fa 50%, #ffffff 100%);
  min-height: 85vh;
  display: flex;
  align-items: center;
}
</style>