// Raises androidx.work:work-runtime above the version Google Mobile Ads declares.
//
// play-services-ads-api 25.5.0 depends on work-runtime 2.7.0, which pulls in
// room-runtime 2.2.5. That Room's consumer R8 rule keeps RoomDatabase
// subclasses but not their no-arg constructors, and AGP 8's R8 full mode
// strips them, so release builds crash at startup creating WorkDatabase.
// work-runtime 2.12.0 brings Room 2.7+, whose rule keeps the constructor.
//
// Remove this plugin once play-services-ads depends on work-runtime >= 2.12.0.
const { withAppBuildGradle } = require('expo/config-plugins');

const WORK_VERSION = '2.12.0';
const MARKER = '// withAndroidxWorkConstraint';

module.exports = function withAndroidxWorkConstraint(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.contents.includes(MARKER)) return cfg;
    cfg.modResults.contents += `
${MARKER}
dependencies {
    constraints {
        implementation("androidx.work:work-runtime:${WORK_VERSION}") {
            because("play-services-ads declares work-runtime 2.7.0 (Room 2.2.5), whose R8 rules break under full mode")
        }
    }
}
`;
    return cfg;
  });
};
