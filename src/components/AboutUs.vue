<script setup>

</script>

<template>
  <div>
    

    <v-container class="py-16">

      <!-- Bold Opening -->
      <v-row justify="center" class="text-center mb-16">
        <v-col cols="12" md="9">
          <div class="text-caption font-weight-bold text-secondary mb-3 tracking-widest">
            OUR STORY
          </div>
          <h1 class="text-h2 font-weight-bold text-secondary mb-6">
            Lost on Campus.<br>
            Found with Care.
          </h1>
          <p class="text-h6 text-grey-darken-2 max-w-650 mx-auto">
            CampusFind was born from a simple frustration: 
            "Why is it so hard to get back what you lost on campus?"
          </p>
        </v-col>
      </v-row>

      <!-- The Spark -->
      <v-row class="mb-16">
        <v-col cols="12" md="7">
          <h2 class="text-h4 font-weight-bold text-secondary mb-8">
            It started with one lost wallet
          </h2>
          <div class="text-body-1 text-grey-darken-1" style="line-height: 1.8;">
            <p class="mb-6">
              In 2024, a group of friends at university kept losing things — 
              wallets, airpods, calculators, even exam scripts. 
              They posted on class WhatsApp groups and asked security — 
              but most items were never returned.
            </p>
            <p>
              Tired of the chaos, they decided to build something better. 
              A platform where lost items don't disappear into thin air — 
              they get a second chance to go home.
            </p>
          </div>
        </v-col>

        <v-col cols="12" md="5" class="d-flex align-center justify-center">
          <v-icon size="180" color="secondary">mdi-lightbulb-on</v-icon>
        </v-col>
      </v-row>

      <!-- How It Works -->
      <v-card class="pa-12 rounded-3xl mb-16" color="grey-lighten-5">
        <h2 class="text-h4 font-weight-bold text-secondary text-center mb-10">
          How CampusFind Works
        </h2>
        
        <v-row class="text-center">
          <v-col cols="12" md="4">
            <div class="mb-6">
              <v-icon size="70" color="secondary">mdi-magnify</v-icon>
            </div>
            <h3 class="text-h6 text-secondary mb-3">1. You Lose Something</h3>
            <p class="text-grey-darken-1">
              Post your lost item with a short description and optional photo.
            </p>
          </v-col>

          <v-col cols="12" md="4">
            <div class="mb-6">
              <v-icon size="70" color="secondary">mdi-magnify-plus-outline</v-icon>
            </div>
            <h3 class="text-h6 text-secondary mb-3">2. Someone Finds It</h3>
            <p class="text-grey-darken-1">
              A fellow student posts what they found with a clear photo.
            </p>
          </v-col>

          <v-col cols="12" md="4">
            <div class="mb-6">
              <v-icon size="70" color="secondary">mdi-check-circle</v-icon>
            </div>
            <h3 class="text-h6 text-secondary mb-3">3. We Help Reunite</h3>
            <p class="text-grey-darken-1">
              Admin verifies the claim using private details and helps return the item safely.
            </p>
          </v-col>
        </v-row>
      </v-card>

      <!-- Vision -->
      <v-card class="pa-12 rounded-3xl mb-16" color="grey-lighten-5">
        <v-row align="center">
          <v-col cols="12" md="8">
            <h2 class="text-h4 font-weight-bold text-secondary mb-6">
              Our Vision
            </h2>
            <p class="text-body-1 text-grey-darken-1">
              To create a campus where losing something doesn't mean losing it forever. 
              A safe, respectful space where students help each other recover what matters — 
              whether it’s a phone, a lucky pen, or a family heirloom.
            </p>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <v-icon size="120" color="secondary">mdi-heart-multiple</v-icon>
          </v-col>
        </v-row>
      </v-card>

      <!-- What We Stand For -->
      <v-row class="mb-16">
        <v-col cols="12">
          <h2 class="text-h4 font-weight-bold text-secondary text-center mb-12">
            What We Stand For
          </h2>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <div class="text-center">
            <v-icon size="56" color="secondary" class="mb-5">mdi-account-school</v-icon>
            <h3 class="text-h6 text-secondary mb-3">Built by Students</h3>
            <p class="text-grey-darken-1">
              We understand campus life because we live it.
            </p>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <div class="text-center">
            <v-icon size="56" color="secondary" class="mb-5">mdi-check</v-icon>
            <h3 class="text-h6 text-secondary mb-3">Trust Through Verification</h3>
            <p class="text-grey-darken-1">
              Every claim is carefully reviewed by admins.
            </p>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <div class="text-center">
            <v-icon size="56" color="secondary" class="mb-5">mdi-recycle</v-icon>
            <h3 class="text-h6 text-secondary mb-3">Reducing Waste</h3>
            <p class="text-grey-darken-1">
              Every returned item means one less thing replaced.
            </p>
          </div>
        </v-col>
      </v-row>

      <!-- Closing Statement -->
      <v-row justify="center" class="text-center">
        <v-col cols="12" md="8">
          <h2 class="text-h4 font-weight-bold text-secondary mb-6">
            This is more than just finding things
          </h2>
          <p class="text-body-1 text-grey-darken-1 mb-10">
            It's about restoring peace of mind, building trust among students, 
            and creating a kinder, more helpful campus community.
          </p>

          <v-btn 
            to="/register" 
            color="secondary" 
            size="large" 
            rounded 
            class="px-12 py-6"
          >
            Be Part of Something Meaningful
          </v-btn>
        </v-col>
      </v-row>

    </v-container>

    <!-- Footer -->
    <v-container fluid class="bg-primary text-center py-4 text-black">
      &copy; 2026 CampusFind. All Rights Reserved.
    </v-container>

  </div>
</template>