#!/usr/bin/env tsx
/**
 * Simple verification script to test feature imports
 */

async function verifyFeatureImports() {
  console.log('🔍 Verifying feature imports...\n');

  try {
    // Test email-inbox feature
    const emailInbox = await import('./client/src/features/email-inbox/index.js');
    console.log('✅ Email Inbox Feature:');
    console.log('   - Exports:', Object.keys(emailInbox).filter(k => k !== 'default').join(', '));
    console.log('   - Config ID:', emailInbox.emailInboxFeature?.id);
    console.log('   - Version:', emailInbox.emailInboxFeature?.version);
    console.log();

    // Test journal feature
    const journal = await import('./client/src/features/journal/index.js');
    console.log('✅ Journal Feature:');
    console.log('   - Exports:', Object.keys(journal).filter(k => k !== 'default').join(', '));
    console.log('   - Config ID:', journal.journalFeature?.id);
    console.log('   - Version:', journal.journalFeature?.version);
    console.log();

    // Test year-grid feature
    const yearGrid = await import('./client/src/features/year-grid/index.js');
    console.log('✅ Year Grid Feature:');
    console.log('   - Exports:', Object.keys(yearGrid).filter(k => k !== 'default').join(', '));
    console.log('   - Config ID:', yearGrid.yearGridFeature?.id);
    console.log('   - Version:', yearGrid.yearGridFeature?.version);
    console.log();

    console.log('✨ All feature imports verified successfully!');
  } catch (error) {
    console.error('❌ Error verifying imports:', error);
    process.exit(1);
  }
}

verifyFeatureImports();
