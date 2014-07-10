module.exports = function (grunt) {
    var gruntConfig = {};

    var ts = Date.now();

    // ======================================
    // Clean
    grunt.loadNpmTasks('grunt-contrib-clean');
    gruntConfig.clean = {
        all: ['dist']
    };

    // ======================================
    // HTML Includes
    // Compile HTML into Dist directory
    grunt.loadNpmTasks('grunt-include-replace');
    gruntConfig.includereplace = {
        dist: {
            files: [
                {src: '**/*.html', dest: 'dist/', expand: true, cwd: 'pages/'},
                {src: 'CNAME', dest: 'dist/', expand: true, cwd: 'pages/'}
            ]
        }
    };

    // ======================================
    // Copy built files to dist directory
    grunt.loadNpmTasks('grunt-contrib-copy');
    gruntConfig.copy = {
        assets: {
            files: [
                {
                    expand: true,
                    cwd: 'assets',
                    src: ['**/**'],
                    dest: 'dist/assets/'
                }
            ]
        }
    };

    // ======================================
    // Watch
    grunt.loadNpmTasks('grunt-contrib-watch');
    gruntConfig.watch = {
        css: {
            files: ['assets/**/**'],
            tasks: ['copy:assets']
        },
        html: {
            files: ['pages/**/**.html', 'pages/**/**.inc'],
            tasks: ['build_html']
        },
        options: {
            spawn: false,
            livereload: true
        }
    };

    // ======================================
    // Watch
    grunt.loadNpmTasks('grunt-http-server');
    gruntConfig['http-server'] = {
        dev: {
            root: 'dist',
            port: 8000,
            host: '0.0.0.0',
            runInBackground: true
        }
    };

    // ======================================
    // Tasks
    grunt.registerTask('build_html', ['includereplace']);

    // Build
    grunt.registerTask('build_all', ['clean', 'build_html', 'copy']);

    // Development
    grunt.registerTask('dev', ['build_all', 'http-server:dev', 'watch']);


    grunt.registerTask('default', ['dev']);


    gruntConfig.pkg = grunt.file.readJSON('package.json');
    grunt.initConfig(gruntConfig);
};
